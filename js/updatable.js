function UpdatableVec3(v = new THREE.Vector3()) {
    this.ol = new THREE.Vector3();
    this.ol.copy(v);

    this.ne = new THREE.Vector3();
    this.ne.copy(v);
}

UpdatableVec3.prototype.swap = function() {
    this.ol.copy(this.ne);
}
