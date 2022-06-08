import * as THREE from './three/three.js';

import { OrbitControls } from './three/OrbitControls.js';
import { ThreeMFLoader } from './three/3MFLoader.js';

let camera, scene, renderer, model, url, raycaster, selection;
let mouse = new THREE.Vector2();
let countries = [];

export function init(modelUrl, onLoad) {
    url = modelUrl;
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();
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
    document.addEventListener( 'mousemove', onMouseMove, false );

    render();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

const countryName = document.querySelector('#country-name');

function onMouseMove(event) {
    event.preventDefault();
    countryName.style.setProperty('left', event.clientX + 'px')
    countryName.style.setProperty('top', (event.clientY + 10) + 'px')
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        intersects.forEach(intersect => {
            selection = intersect.object
            if(countries.some(x => x.id === selection.uuid)){
                if(countryName.hasAttribute('hidden'))
                    countryName.removeAttribute('hidden');
                let country = countries.find(x => x.id === selection.uuid);
                countryName.textContent = country.name;
            }
            else {
                if(!countryName.hasAttribute('hidden'))
                    countryName.setAttribute('hidden', '');
                countryName.textContent = '';
            }
        });

    } else {
        selection = null;
        countryName.textContent = '';
    }
}

function render() {
    renderer.render( scene, camera );
}

export function addModel(modelUrl, countryName, onLoad){
    const manager = new THREE.LoadingManager();

    const loader = new ThreeMFLoader( manager );
    loader.load( modelUrl, function ( object ) {
        object.quaternion.setFromEuler( new THREE.Euler( - Math.PI / 2, 0, 0 ) ); 	// z-up conversion

        object.traverse( function ( child ) {

            child.castShadow = true;

        } );
        countries.push({
            id:object.children[0].children[0].uuid,
            name:countryName
        });
        scene.add(object)
        onLoad();
        render();
    } );
}

export function clearModels(){
    countries = [];
    for (let i = 3; i < scene.length; i++){
        scene.remove(i);
    }
}