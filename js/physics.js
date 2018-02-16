const GRAV_FORCE = new THREE.Vector3(0, -9.8, 0);

function ClothNode(mass, x, y, pos) {
    this.mass = mass;
    this.x    = x;
    this.y    = y;
    this.pos  = pos;
    this.vel  = new THREE.Vector3(0, 0, 0);
    this.acc  = new THREE.Vector3(0, 0, 0);
}

ClothNode.prototype.updatePhysics = function(cloth, dt) {
    var neighbors = cloth.getNeighbors(this.x, this.y);
    // TODO: Add acc calculation here


    /* Do Eulerian integration for velocity */
    var dv = this.acc;
    dv.multiply(dt);
    this.vel.add(dv);

    /* Do Eulerian integration for position */
    var dp = this.vel;
    dp.multiply(dt);
    this.pos.add(this.dp);
}

function Cloth(node_mass, tension, w, h) {
    this.nodes   = new Array();
    this.tension = tension;
    this.width   = w;
    this.height  = h;

    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            this.nodes[this.nodeIndex(i, j)] = new ClothNode(node_mass, i, j,
                                                             new THREE.Vector3(i, j, 0));
        }
    }
}

Cloth.prototype.updatePhysics = function(dt) {
    for (node in this.nodes) {
        node.updatePhysics(this, dt);
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
    //width

    return
}
