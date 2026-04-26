"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockingPathBuilder = void 0;
var BlockingPathBuilder;
(function (BlockingPathBuilder) {
    function buildFromPoints(points, width, height = 4) {
        if (!points || points.length < 2) {
            return null;
        }
        const builder = new MeshBuilder([
            { name: "position", components: 3 },
            { name: "normal", components: 3, normalized: true },
            { name: "texture0", components: 2 }
        ]);
        builder.topology = MeshTopology.Triangles;
        builder.indexType = MeshIndexType.UInt16;
        const vertices = [];
        const up = vec3.up();
        const halfWidth = width * 0.5;
        const halfHeight = Math.max(height * 0.5, 0.25);
        const validPoints = [];
        for (let i = 0; i < points.length; i++) {
            const current = points[i];
            const forward = i < points.length - 1 ? points[i + 1].sub(current) : current.sub(points[i - 1]);
            if (forward.length <= 0.0001) {
                continue;
            }
            const right = forward.cross(up).normalize();
            const r = right.uniformScale(halfWidth);
            const u = up.uniformScale(halfHeight);
            // 4 verts per path point (cross section):
            // 0 leftTop, 1 rightTop, 2 leftBottom, 3 rightBottom
            const leftTop = current.sub(r).add(u);
            const rightTop = current.add(r).add(u);
            const leftBottom = current.sub(r).sub(u);
            const rightBottom = current.add(r).sub(u);
            const uvY = i;
            vertices.push(leftTop.x, leftTop.y, leftTop.z, up.x, up.y, up.z, 0, uvY);
            vertices.push(rightTop.x, rightTop.y, rightTop.z, up.x, up.y, up.z, 1, uvY);
            vertices.push(leftBottom.x, leftBottom.y, leftBottom.z, -up.x, -up.y, -up.z, 0, uvY);
            vertices.push(rightBottom.x, rightBottom.y, rightBottom.z, -up.x, -up.y, -up.z, 1, uvY);
            validPoints.push(current);
        }
        if (validPoints.length < 2 || vertices.length < 32) {
            return null;
        }
        builder.appendVerticesInterleaved(vertices);
        const segmentCount = validPoints.length;
        const indices = [];
        for (let i = 0; i < segmentCount - 1; i++) {
            const a = i * 4;
            const b = (i + 1) * 4;
            const aLT = a + 0;
            const aRT = a + 1;
            const aLB = a + 2;
            const aRB = a + 3;
            const bLT = b + 0;
            const bRT = b + 1;
            const bLB = b + 2;
            const bRB = b + 3;
            // Top face
            indices.push(aLT, aRT, bLT);
            indices.push(bRT, bLT, aRT);
            // Bottom face
            indices.push(aLB, bLB, aRB);
            indices.push(bRB, aRB, bLB);
            // Left side
            indices.push(aLB, aLT, bLB);
            indices.push(bLT, bLB, aLT);
            // Right side
            indices.push(aRT, aRB, bRT);
            indices.push(bRB, bRT, aRB);
        }
        builder.appendIndices(indices);
        builder.updateMesh();
        return builder.getMesh();
    }
    BlockingPathBuilder.buildFromPoints = buildFromPoints;
})(BlockingPathBuilder || (exports.BlockingPathBuilder = BlockingPathBuilder = {}));
//# sourceMappingURL=BlockingPathBuilder.js.map