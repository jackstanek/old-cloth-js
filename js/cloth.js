var renderer, scene, camera;
var cloth, geometry, material, light, torus;

var prev_time = 0;

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

    cloth    = new Cloth(1, 1, 1, 3);
    geometry = new THREE.BoxGeometry(1, 1, 1);
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

function animate(curr_time) {
    requestAnimationFrame(animate);

    if (prev_time === 0) {
        prev_time = curr_time;
    }

    dt = curr_time - prev_time;

    renderer.render(scene, camera);
}
