import * as THREE from './three/three.js';

import { OrbitControls } from './three/OrbitControls.js';
import { ThreeMFLoader } from './three/3MFLoader.js';

let camera, scene, renderer, model, url;

export function init(modelUrl, onLoad) {
    url = modelUrl;
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 10, 5000 );

    camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.set( 2000, 0, 0 );
    scene.add( camera );

    const ambLight = new THREE.AmbientLight(0xa5a5a5);
    scene.add(ambLight);

    const manager = new THREE.LoadingManager();

    const loader = new ThreeMFLoader( manager );
    loader.load( url, function ( object ) {
        object.quaternion.setFromEuler( new THREE.Euler( - Math.PI / 2, 0, 0 ) ); 	// z-up conversion

        object.traverse( function ( child ) {

            child.castShadow = true;

        } );

        scene.add( object );
        model = object;
        onLoad();
    } );

    //

    manager.onLoad = function () {
        render();
    };

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild( renderer.domElement );

    //

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    controls.minDistance = 1500;
    controls.maxDistance = 3000;
    controls.enablePan = false;
    controls.target.set( 0, 0, 0 );
    controls.update();

    window.addEventListener( 'resize', onWindowResize );

    render();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function render() {
    //requestAnimationFrame( render );
    /*
    if(urlChanged){
        urlChanged = false;
        const manager = new THREE.LoadingManager();

        const loader = new ThreeMFLoader( manager );
        loader.load( url, function ( object ) {
            object.quaternion.setFromEuler( new THREE.Euler( - Math.PI / 2, 0, 0 ) ); 	// z-up conversion

            object.traverse( function ( child ) {

                child.castShadow = true;

            } );

            scene.children[2] = object;
        } );
    }*/

    renderer.render( scene, camera );
}

export function setUrl(modelUrl, onLoad){
    const manager = new THREE.LoadingManager();

    const loader = new ThreeMFLoader( manager );
    loader.load( modelUrl, function ( object ) {
        object.quaternion.setFromEuler( new THREE.Euler( - Math.PI / 2, 0, 0 ) ); 	// z-up conversion

        object.traverse( function ( child ) {

            child.castShadow = true;

        } );

        scene.children[2] = object;
        onLoad();
        render();
    } );
}