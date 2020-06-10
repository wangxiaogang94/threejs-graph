import React from 'react';
import * as THREE from 'three';
// import Stats from 'three/examples/jsm/libs/stats.module.js';
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

// String.prototype.format = function () {
//     var str = this;

//     for (var i = 0; i < arguments.length; i++) {
//         str = str.replace('{' + i + '}', arguments[i]);
//     }
//     return str;
// };
class Graph extends React.Component {
    container = null; // 容器
    params = {
        chordal: true,
    };
    splines = {};
    // stats = null;
    camera = null;
    scene = null;
    renderer = null;
    positions = [];
    splineHelperObjects = [];
    splinePointsLength = 4;
    transformControl = null;
    ARC_SEGMENTS = 200;
    componentDidMount() {
        this.point = new THREE.Vector3();
        this.geometry = new THREE.SphereGeometry(20, 30, 30);
        this.init();
        this.animate();
    }
    /**
     * 新建node点
     */
    addNode = () => {
        // 节点材质 颜色
        var material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
        // new node
        var object = new THREE.Mesh(this.geometry, material);
        // 随机坐标
        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600;
        object.position.z = Math.random() * 800 - 400;

        object.castShadow = true; // 对象是否被渲染到阴影贴图中。
        object.receiveShadow = true; // 材质是否接收阴影。
        this.scene.add(object);
        this.splineHelperObjects.push(object); // 保存起来
        return object;
    };
    updateSplineOutline = () => {
        for (var k in this.splines) {
            var spline = this.splines[k];

            var splineMesh = spline.mesh;
            var position = splineMesh.geometry.attributes.position;

            for (var i = 0; i < this.ARC_SEGMENTS; i++) {
                var t = i / (this.ARC_SEGMENTS - 1);
                spline.getPoint(t, this.point);
                position.setXYZ(i, this.point.x, this.point.y, this.point.z);
            }

            position.needsUpdate = true;
        }
    };
    load = new_positions => {
        for (var i = 0; i < this.positions.length; i++) {
            this.positions[i].copy(new_positions[i]);
        }
        this.updateSplineOutline();
    };
    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderFun();
        // this.stats.update();
    };

    renderFun = () => {
        this.splines.chordal.mesh.visible = this.params.chordal;
        this.renderer.render(this.scene, this.camera);
    };
    cancelHideTransform = () => {
        if (this.hiding) clearTimeout(this.hiding);
    };

    delayHideTransform = () => {
        this.cancelHideTransform();
        this.hideTransform();
    };

    hideTransform = () => {
        this.hiding = setTimeout(() => {
            this.transformControl.detach(this.transformControl.object);
        }, 2500);
    };

    addOrbitControls = () => {
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.damping = 0.2;
        this.orbitControls.addEventListener('change', this.renderFun);

        this.orbitControls.addEventListener('start', () => {
            this.cancelHideTransform();
        });

        this.orbitControls.addEventListener('end', () => {
            this.delayHideTransform();
        });
    };

    addTransformControl = () => {
        this.transformControl = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControl.addEventListener('change', this.renderFun);
        this.transformControl.addEventListener('dragging-changed',  (event)=> {
            if (this.orbitControls) {
                this.orbitControls.enabled = !event.value;
            }
        });
        this.scene.add(this.transformControl);
        this.transformControl.addEventListener('change', () => {
            this.cancelHideTransform();
        });
        this.transformControl.addEventListener('mouseDown', () => {
            this.cancelHideTransform();
        });
        this.transformControl.addEventListener('mouseUp', () => {
            this.delayHideTransform();
        });
        this.transformControl.addEventListener('objectChange', () => {
            this.updateSplineOutline();
        });
    };

    addDragControls = () => {
        var dragcontrols = new DragControls(
            this.splineHelperObjects,
            this.camera,
            this.renderer.domElement
        ); //
        dragcontrols.enabled = false;
        dragcontrols.addEventListener('hoveron', event => {
            this.transformControl.attach(event.object);
            this.cancelHideTransform();
        });

        dragcontrols.addEventListener('hoveroff', () => {
            this.delayHideTransform();
        });
    };

    renderEdge = () => {
        this.positions = [];

        for (var i = 0; i < this.splinePointsLength; i++) {
            this.positions.push(this.splineHelperObjects[i].position);
        }

        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3)
        );

        let curve = new THREE.CatmullRomCurve3(this.positions);
        curve.curveType = 'chordal';
        curve.mesh = new THREE.Line(
            geometry.clone(),
            new THREE.LineBasicMaterial({
                color: 0x0000ff,
                opacity: 0.35,
            })
        );
        curve.mesh.castShadow = true;
        this.splines.chordal = curve;

        for (var k in this.splines) {
            var spline = this.splines[k];
            this.scene.add(spline.mesh);
        }
        this.updateSplineOutline();
    }

    init = () => {
        this.container = document.getElementById('graph');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );
        this.camera.position.set(0, 250, 1000);
        this.scene.add(this.camera);
        // 灯光
        this.scene.add(new THREE.AmbientLight(0xf0f0f0));
        var light = new THREE.SpotLight(0xffffff, 1.5);
        light.position.set(0, 1500, 200);
        light.angle = Math.PI * 0.2;
        light.castShadow = true;
        light.shadow.camera.near = 200;
        light.shadow.camera.far = 2000;
        light.shadow.bias = -0.000222;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        this.scene.add(light);
        // 地面阴影
        var planeGeometry = new THREE.PlaneBufferGeometry(2000, 2000);
        planeGeometry.rotateX(-Math.PI / 2);
        var planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });

        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.y = -200;
        plane.receiveShadow = true;
        this.scene.add(plane);
        // 网格
        var helper = new THREE.GridHelper(2000, 100);
        helper.position.y = -199;
        helper.material.opacity = 0.25;
        helper.material.transparent = true;
        this.scene.add(helper);

        // 渲染
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);


        // Controls
        this.addOrbitControls();
        this.addTransformControl();
        this.addDragControls();


        /**
         * 添加节点
         */
        for (var i = 0; i < this.splinePointsLength; i++) {
            this.addNode(this.positions[i]);
        }
        /**
         * 渲染边
         */
        this.renderEdge();

        
    };
    render() {
        return (
            <div className="graph">
                <div id="graph" style={{ height: '100vh' }}></div>
            </div>
        );
    }
}

export default Graph;
