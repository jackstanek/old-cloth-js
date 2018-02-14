var renderer, scene, camera;
var geometry, material, light, torus;

function maximizeRendererSize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.onload  = function() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,
                                         0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    maximizeRendererSize();
    document.body.appendChild(renderer.domElement);

    geometry = new THREE.ParametricGeometry(clothGeometryFunc, 25, 25);
    material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
    light    = new THREE.DirectionalLight(0xffffff, 1);
    light.position = new THREE.Vector3(-1, -1, 1);
    torus    = new THREE.Mesh(geometry, material);
    scene.add(torus);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.05));
    camera.position.z = 5;

    animate();
}

window.onresize = maximizeRendererSize;

function animate(dt) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
