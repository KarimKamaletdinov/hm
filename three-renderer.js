import * as THREE from './three/three.js';

import { OrbitControls } from './three/OrbitControls.js';
import { ThreeMFLoader } from './three/3MFLoader.js';

let camera, scene, renderer, raycaster, selection, nothingHovered;
let mouse = new THREE.Vector2();
let models = [];

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();
}

function onMouseMove(event) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        intersects.forEach(intersect => {
            selection = intersect.object
            if(models.some(x => x.id === selection.uuid)){
                let model = models.find(x => x.id === selection.uuid);
                model.hover(event);
            }
            else {
                nothingHovered();
            }
        });

    } else {
        nothingHovered();
    }
}

function render() {
    renderer.render( scene, camera );
}

function loadModel(url, onLoad) {
    const manager = new THREE.LoadingManager(render);
    const loader = new ThreeMFLoader(manager);
    loader.load(url, function (object) {
        object.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)); 	// z-up conversion

        object.traverse(function (child) {
            child.castShadow = true;
        });

        scene.add(object);
        onLoad(object);
    });
}

export function init(modelUrl, onLoad, onNothingHovered) {
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();
    nothingHovered = onNothingHovered;
    scene.background = new THREE.Color( 0x000000 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 10, 5000 );

    camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.set( 2000, 0, 0 );
    scene.add( camera );

    const ambLight = new THREE.AmbientLight(0xa5a5a5);
    scene.add(ambLight);
    loadModel(modelUrl, _ => onLoad());

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild( renderer.domElement );
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    controls.minDistance = 1500;
    controls.maxDistance = 3000;
    controls.enablePan = false;
    controls.target.set( 0, 0, 0 );
    controls.update();

    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener( 'mousemove', onMouseMove, false );

    render();

}

export function addModel(modelUrl, onLoad, onHover){
    loadModel(modelUrl, object => {
        models.push({
            id: object.children[0].children[0].uuid,
            hover: onHover
        });
        onLoad();
        render();
    })
}

export function clearModels(){
    models = [];
    for (let i = 3; i < scene.length; i++){
        scene.remove(i);
    }
}

export function getElement(){
    return renderer.domElement;
}