const GRAV_FORCE = THREE.Vector3(0, -9.8, 0);

function ClothNode(mass, x, y, pos) {
    this.mass = mass;
    this.x    = x;
    this.y    = y;
    this.pos  = pos;
    this.vel  = THREE.Vector3(0, 0, 0);
    this.acc  = THREE.Vector3(0, 0, 0);
}

ClothNode.prototype.updatePhysics = function(cloth, x, y) {
    var neighbors = cloth.getNeighbors(x, y);
}

function Cloth(node_mass, tension, w, h) {
    this.nodes   = new Array();
    this.tension = tension;
    this.width   = w;
    this.height  = h;

    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            this.nodes[this.nodeIndex(i, j)] = new ClothNode(node_mass, i, j,
                                                             THREE.Vector3(i, j, 0));
        }
    }
}

Cloth.prototype.updatePhysics = function(dt) {
    for (node in this.nodes) {
        node.updatePhysics(this, 0, i);
    }
}

Cloth.prototype.nodeIndex = function(x, y) {
    return y * this.width + x;
}

Cloth.prototype.isValid = function(pos) {
    var x, y;
    [x, y] = pos;

    return (x >= 0 && x < width &&
            y >= 0 && y < height);
}

Cloth.prototype.getNeighbors = function(x, y) {
    if (!isValid([x, y])) {
        return undefined;
    } else {
        return [[x - 1, y],
                [x + 1, y],
                [x, y - 1],
                [x, y + 1]].filter(this.isValid);
    }
}

Cloth.prototype.clothGeometryFunc = function(u, v) {
    var uFrac, vFrac;
    [u, uFrac] = Math.floor(u), u % 1;
    [v, vFrac] = Math.fllor(v), v % 1;
}
