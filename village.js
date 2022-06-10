const canvas = document.getElementById("canvas");
const engine = new BABYLON.Engine(canvas, true);

createScene = () =>{
   const scene = new BABYLON.Scene(engine);
     
   // CAMERA AND LIGHT
   const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0,0,0));
   camera.attachControl(canvas, true);
   const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1,1,0));
   
   buildDwellings();
   buildcarAnimation();
    
   return scene;
}

const scene = createScene();
engine.runRenderLoop(function () {
   scene.render();
});
window.addEventListener("resize", function() {
   engine.resize();
});
buildsphere();


/***  FUNCTIONS  ***/

function buildground() {
   const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:15, height:16});
   const groundMaterial = new BABYLON.StandardMaterial("groundMaterial");
   groundMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/valleygrass.png");
   groundMaterial.diffuseTexture.hasAlpha = true;
   // groundMaterial.diffuseColor = new BABYLON.Color3(0,1,0);    // OR new BABYLON.Color3.Green();
   ground.material = groundMaterial;     // We set it to material property of ground
}

function buildbox1() {
   const faceUV = [];
   faceUV[0] = new BABYLON.Vector4(0.5, 0.0, 0.75, 1.0);
   faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.25, 1.0);
   faceUV[2] = new BABYLON.Vector4(0.25, 0, 0.5, 1.0);
   faceUV[3] = new BABYLON.Vector4(0.75, 0, 1.0, 1.0);
   const box1 = BABYLON.MeshBuilder.CreateBox("box1", {width:3, height:3, depth:3, faceUV: faceUV, wrap: true});
   box1.position.x = -4;
   box1.position.y = 1.5;
   const box1Material = new BABYLON.StandardMaterial("box1Material");
   box1Material.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/cubehouse.png");
   box1.material = box1Material;
   
   return box1;
}

function buildroof() {
   const roof = new BABYLON.CreateCylinder("roof", {diameter:2.8, height:3.5, tessellation:3});
   roof.position = new BABYLON.Vector3(-4,3.5,0);
   roof.rotation.z = Math.PI / 2;
   roof.scaling.z = 1.5;
   const roofMat = new BABYLON.StandardMaterial("roofMat");
   roofMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/roof.jpg");
   roof.material = roofMat;
   
   return roof;
}

function buildhouse() {
   const box1 = buildbox1();
   const roof = buildroof();
   return BABYLON.Mesh.MergeMeshes([box1, roof], true, false, null, false, true);
}

function orderedHouses(x) {
   let house = buildhouse();
   for(let i=0; i<11; i=i+2){
      const instanceHouse = house.createInstance("instanceHouse");
         instanceHouse.position.x = i-4;
         instanceHouse.position.z = x;
         instanceHouse.scaling = new BABYLON.Vector3(0.5,0.5,0.5);    
   }
}

function buildDwellings() {
   buildground();
   buildhouse();
   orderedHouses(5);
   orderedHouses(-5);
}

var carReady = false;
function buildcarAnimation() {
   BABYLON.SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "car.babylon").then(() => {
   const car = scene.getMeshByName("car");
   carReady = true;
   car.position.y = 0.2;
   
   const carAnimation = new BABYLON.Animation("carAnimation", "position.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
   const carKeys = [];
   carKeys.push({frame:0, value:-2});
   carKeys.push({frame:150, value:4});
   carKeys.push({frame:210, value:-2});
   carAnimation.setKeys(carKeys);
   car.animations = [];
   car.animations.push(carAnimation);
   scene.beginAnimation(car, 0, 210, true);
   
   const wheelRB = scene.getMeshByName("wheelRB");
   const wheelRF = scene.getMeshByName("wheelRF");
   const wheelLB = scene.getMeshByName("wheelLB");
   const wheelLF = scene.getMeshByName("wheelLF");

   scene.beginAnimation(wheelRB, 0, 30, true);
   scene.beginAnimation(wheelRF, 0, 30, true);
   scene.beginAnimation(wheelLB, 0, 30, true);
   scene.beginAnimation(wheelLF, 0, 30, true);
     });
}

function buildsphere() {
   const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:0.25});
   sphere.position = new BABYLON.Vector3(4, 0.125, 3);
   
   const slide = function (turn, dist) {
      this.turn = turn;
      this.dist = dist;}
      
   var track = [];
   track[0] = new slide(Math.PI / 2, 6);
   track[1] = new slide(Math.PI / 2, 12);
   track[2] = new slide(Math.PI / 2, 18);
   track[3] = new slide(Math.PI / 2, 24);
   
   // let hitBox = buildhitBox();  
   let distance = 0, step = 0.05, i = 0;
   
   scene.onBeforeRenderObservable.add(() => {   
      if(carReady) {
         // if(scene.getMeshByName("car").intersectsMesh(hitBox) && sphere.intersectsMesh(hitBox)){return;}
         if(sphere.intersectsMesh(scene.getMeshByName("car"))){return;}
       }
   
      sphere.movePOV(0, 0, step);
      distance += step;
      
      if (distance > track[i].dist) { 
         sphere.rotate(BABYLON.Axis.Y, track[i].turn, BABYLON.Space.LOCAL);
         i +=1;
         i %= track.length;
         if (i === 0) {
            distance = 0;
            sphere.position = new BABYLON.Vector3(4, 0, 3); //reset to initial conditions
            sphere.rotation = BABYLON.Vector3.Zero(); //prevents error accumulation
         }
      }
   });
   
   return sphere;
}

 /* function buildhitBox() {
   const wireMat = new BABYLON.StandardMaterial("wireMat");
   wireMat.alpha = 1;
   hitBox = BABYLON.MeshBuilder.CreateBox("carbox", {width: 0.5, height: 0.6, depth: 1});
   hitBox.material = wireMat;
   hitBox.position = new BABYLON.Vector3(-2, 0.3, 0.1);
   return hitBox;
}
 */
/* function walkingMan() {
   BABYLON.SceneLoader.ImportMeshAsync("him", "/scenes/Dude/", "Dude.babylon").then((result) => {
   var man = result.meshes[0];
   man.scaling = new BABYLON.Vector3(0.25, 0.25, 0.25);
   scene.beginAnimation(result.skeletons[0], 0, 100, true, 1.0);
   });
}
 */


