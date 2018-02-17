/* Some constants. GRAV_ACC is not really a force since it is
 * constant for every object. */
const GRAV_ACC   = new THREE.Vector3(0, -10, 0);

const DEFAULT_MATERIAL = new THREE.MeshPhongMaterial({color: 0x00ff00});

function ClothNode(mass, index, pos, tension, damping) {
    this.mass     = mass;
    this.index    = index;
    this.pos      = pos;
    this.dp       = new THREE.Vector3();
    this.vel      = new THREE.Vector3();
    this.dv       = new THREE.Vector3();
    this.acc      = new THREE.Vector3();
    this.mesh     = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3),
                                   DEFAULT_MATERIAL);
    this.mesh.position.copy(this.pos);
}

ClothNode.prototype.updatePhysics = function(cloth, dt) {
    if (this.index === 0) {
        return;
    }

    //var neighbors = cloth.getNeighbors(this.x, this.y);
    // TODO: generalize force calculations
    var total_forces = new THREE.Vector3();

    // Spring restorative force
    var tmp_pos = new THREE.Vector3();
    tmp_pos.copy(this.pos);
    tmp_pos.sub(cloth.pin);
    tmp_pos.negate();
    var curr_spring_len = tmp_pos.length();
    /* Add in the spring force (Hooke's Law) */
    total_forces.add(tmp_pos
                     .normalize()
                     .multiplyScalar(cloth.tension *
                                     (curr_spring_len - cloth.spring_len)));

    // Damping force
    var tmp_vel = new THREE.Vector3();
    tmp_vel.copy(this.vel);
    tmp_vel.negate();
    total_forces.add(tmp_vel.multiplyScalar(cloth.damping));

    // Forces from neighboring springs

    this.acc.copy(total_forces.divideScalar(this.mass));
    this.acc.add(GRAV_ACC);

    /* Do Eulerian integration for velocity */
    this.dv.copy(this.acc);
    this.dv.multiplyScalar(dt);
    this.vel.add(this.dv);

    /* Do Eulerian integration for position */
    this.dp.copy(this.vel);
    this.dp.multiplyScalar(dt);
    this.pos.add(this.dp);

    this.mesh.position.copy(this.pos);
}

/* For now, a Cloth object simply represents a thread, string, or
 * rope-like object. */
function Cloth(node_mass, tension, damping, length) {
    this.nodes      = new Array();
    this.tension    = tension;
    this.damping    = damping;
    this.spring_len = 1; // TODO: Make this adjustable (for size of cloth and so forth)

    for (let i = 0; i < length; i++) {
        this.nodes[i] = new ClothNode(node_mass, i,
                                      new THREE.Vector3(0, length - i, 0));
    }

    this.pin = new THREE.Vector3();
    this.pin.copy(this.nodes[0].pos);
}

Cloth.prototype.updatePhysics = function(dt) {
    for (node in this.nodes) {
        this.nodes[node].updatePhysics(this, dt);
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
                [x, y + 1]].filter(this.isValid).map(this.nodeIndex);
    }
}

Cloth.prototype.initScene = function(scene) {
    for (let i = 0; i < this.nodes.length; i++) {
        scene.add(this.nodes[i].mesh);
    }
}

Cloth.prototype.clothGeometryFunc = function(u, v) {
    //width

    //return
}
