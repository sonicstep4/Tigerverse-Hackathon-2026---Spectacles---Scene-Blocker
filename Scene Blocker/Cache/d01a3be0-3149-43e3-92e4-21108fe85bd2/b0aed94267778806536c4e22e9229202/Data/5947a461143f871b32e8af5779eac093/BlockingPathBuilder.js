"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockingPathBuilder = void 0;
var BlockingPathBuilder;
(function (BlockingPathBuilder) {
    function buildFromPoints(points, width, height = 4, capLength = 0, capSegments = 0) {
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
        const samples = [];
        const cappedSegments = Math.max(0, Math.floor(capSegments));
        const cappedLength = Math.max(0, capLength);
        const startDirRaw = points[1].sub(points[0]);
        const endDirRaw = points[points.length - 1].sub(points[points.length - 2]);
        const startDir = startDirRaw.length > 0.0001 ? startDirRaw.normalize() : new vec3(0, 0, 1);
        const endDir = endDirRaw.length > 0.0001 ? endDirRaw.normalize() : new vec3(0, 0, 1);
        if (cappedSegments > 0 && cappedLength > 0) {
            for (let i = 0; i < cappedSegments; i++) {
                const t = i / cappedSegments;
                const distance = cappedLength * (1 - t);
                const scale = Math.max(0.02, Math.sin(t * Math.PI * 0.5));
                const pos = points[0].sub(startDir.uniformScale(distance));
                samples.push({ position: pos, scale: scale });
            }
        }
        for (let i = 0; i < points.length; i++) {
            samples.push({ position: points[i], scale: 1.0 });
        }
        if (cappedSegments > 0 && cappedLength > 0) {
            for (let i = 1; i <= cappedSegments; i++) {
                const t = i / cappedSegments;
                const distance = cappedLength * t;
                const scale = Math.max(0.02, Math.cos(t * Math.PI * 0.5));
                const pos = points[points.length - 1].add(endDir.uniformScale(distance));
                samples.push({ position: pos, scale: scale });
            }
        }
        const vertices = [];
        const up = vec3.up();
        const halfWidth = width * 0.5;
        const halfHeight = Math.max(height * 0.5, 0.25);
        const validPoints = [];
        let distanceAccumulator = 0;
        for (let i = 0; i < samples.length; i++) {
            const current = samples[i].position;
            const widthScale = samples[i].scale;
            const forward = i < samples.length - 1 ? samples[i + 1].position.sub(current) : current.sub(samples[i - 1].position);
            if (forward.length <= 0.0001) {
                continue;
            }
            const right = forward.cross(up).normalize();
            const r = right.uniformScale(halfWidth * widthScale);
            const u = up.uniformScale(halfHeight * widthScale);
            // 4 verts per path point (cross section):
            // 0 leftTop, 1 rightTop, 2 leftBottom, 3 rightBottom
            const leftTop = current.sub(r).add(u);
            const rightTop = current.add(r).add(u);
            const leftBottom = current.sub(r).sub(u);
            const rightBottom = current.add(r).sub(u);
            if (validPoints.length > 0) {
                distanceAccumulator += current.distance(validPoints[validPoints.length - 1]);
            }
            const uvY = distanceAccumulator / Math.max(width, 1);
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