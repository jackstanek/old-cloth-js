const GRAV_FORCE = new THREE.Vector3(0, -9.8, 0);
const PIN_POS = new THREE.Vector3(0, 5, 0);
const TENSION = 10;

function ClothNode(mass, x, y, pos) {
    this.mass = mass;
    this.x    = x;
    this.y    = y;
    this.pos  = pos;
    this.dp   = new THREE.Vector3();
    this.vel  = new THREE.Vector3();
    this.dv   = new THREE.Vector3();
    this.acc  = GRAV_FORCE;
}

ClothNode.prototype.updatePhysics = function(cloth, dt) {
    //var neighbors = cloth.getNeighbors(this.x, this.y);
    // TODO: generalize force calculations
    var total_forces = new THREE.Vector3();
    total_forces.add(GRAV_FORCE);

    var tmp_pos = new THREE.Vector3();
    tmp_pos.copy(this.pos);
    tmp_pos.sub(PIN_POS);
    tmp_pos.negate();
    total_forces.add(tmp_pos.multiplyScalar(TENSION)); // spring force (hooke's law)

    this.acc.copy(total_forces.multiplyScalar(this.mass));

    /* Do Eulerian integration for velocity */
    this.dv.copy(this.acc);
    this.dv.multiplyScalar(dt);
    this.vel.add(this.dv);

    /* Do Eulerian integration for position */
    this.dp.copy(this.vel);
    this.dp.multiplyScalar(dt);
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

    //return
}
