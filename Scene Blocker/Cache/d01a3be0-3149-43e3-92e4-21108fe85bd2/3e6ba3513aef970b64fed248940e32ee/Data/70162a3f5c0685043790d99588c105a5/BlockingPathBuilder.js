"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockingPathBuilder = void 0;
var BlockingPathBuilder;
(function (BlockingPathBuilder) {
    function buildFromPoints(points, width) {
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
        const upVec = vec3.up();
        for (let i = 0; i < points.length; i++) {
            const current = points[i];
            const forward = i < points.length - 1 ? points[i + 1].sub(current) : current.sub(points[i - 1]);
            if (forward.length <= 0.0001) {
                continue;
            }
            const up = upVec.projectOnPlane(forward).normalize();
            const right = forward.cross(up).normalize().uniformScale(width * 0.5);
            const leftPoint = current.sub(right);
            const rightPoint = current.add(right);
            const uvY = i;
            vertices.push(leftPoint.x, leftPoint.y, leftPoint.z, up.x, up.y, up.z, 0, uvY);
            vertices.push(rightPoint.x, rightPoint.y, rightPoint.z, up.x, up.y, up.z, 1, uvY);
        }
        if (vertices.length < 16) {
            return null;
        }
        builder.appendVerticesInterleaved(vertices);
        const segmentCount = vertices.length / 16;
        const indices = [];
        for (let i = 0; i < segmentCount - 1; i++) {
            const leftIndex = i * 2;
            const rightIndex = leftIndex + 1;
            const nextLeftIndex = leftIndex + 2;
            const nextRightIndex = rightIndex + 2;
            indices.push(leftIndex, rightIndex, nextLeftIndex);
            indices.push(nextRightIndex, nextLeftIndex, rightIndex);
        }
        builder.appendIndices(indices);
        builder.updateMesh();
        return builder.getMesh();
    }
    BlockingPathBuilder.buildFromPoints = buildFromPoints;
})(BlockingPathBuilder || (exports.BlockingPathBuilder = BlockingPathBuilder = {}));
//# sourceMappingURL=BlockingPathBuilder.js.map