import React from 'react';

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import fontJson from './Source Han Sans CN Normal_Regular.json';
import police from './police.png';
import DragControls from './dragControls.js';

class Graph extends React.Component {
    container = null; // 容器
    splines = {};
    // stats = null;
    camera = null;
    scene = null;
    renderer = null;
    positions = [];
    nodes = [];
    splinePointsLength = 4;
    transformControl = null;
    ARC_SEGMENTS = 200;
    componentDidMount() {
        this.point = new THREE.Vector3();
        this.geometry = new THREE.SphereGeometry(20, 30, 30);
        const data = this.sphereLayout(this.getMockData());
        this.init(data);
        this.animate();
    }

    getRandomText = () => {
        let word;
        eval('word=' + '"\\u' + (Math.round(Math.random() * 20901) + 19968).toString(16) + '"'); //生成随机汉字
        return word;
    };

    getMockText = () => {
        //const text = '"\\u' + (Math.round(Math.random() * 20901) + 19968).toString(16)+ '"';
        return this.getRandomText() + this.getRandomText();
    };

    getMockData = () => {
        const nodes = [];
        const edges = [];
        for (let index = 0; index < 200; index++) {
            nodes.push({
                id: '' + index,
                text: this.getMockText(),
            });
        }
        for (let index = 0; index < nodes.length; index += 1) {
            const element = nodes[index];
            const target = '1' //+ Math.ceil(Math.random() * 199);
            edges.push({
                id: 'edge' + index,
                source: element.id,
                target,
            });
        }
        return { nodes, edges };
    };
    /**
     * 新建node点
     */
    addNode = node => {
        var textureLoader = new THREE.TextureLoader();
        var texture1 = textureLoader.load(police);
        // 节点材质 颜色
        var material = new THREE.MeshLambertMaterial({ map: texture1 });
        // new node
        var object = new THREE.Mesh(this.geometry, material);
        // console.log(node.x,node.y,node.z)
        // 随机坐标
        if (node.x) {
            object.position.x = node.x;
            object.position.y = node.y;
            object.position.z = node.z;
        } else {
            object.position.x = Math.random() * 1000 - 500;
            object.position.y = Math.random() * 600;
            object.position.z = Math.random() * 800 - 400;
        }

        object.castShadow = true; // 对象是否被渲染到阴影贴图中。
        object.receiveShadow = true; // 材质是否接收阴影。
        const text = node.text || '';
        var geometry = new THREE.TextBufferGeometry(text, {
            font: new THREE.Font(fontJson),
            size: 8,
            height: 1,
        });

        const materials = [
            new THREE.MeshPhongMaterial({ color: '#000', flatShading: true }), // front
            // new THREE.MeshPhongMaterial({ color: 0xffffff }), // side
        ];

        const mesh = new THREE.Mesh(geometry, materials);
        mesh.position.x = (-4 * text.length) / 2;
        mesh.position.y = -35;

        object.add(mesh);
        object.userData = { ...node };
        this.scene.add(object);
        this.nodes.push(object); // 保存起来
        return object;
    };
    updateSplineOutline = () => {
        this.edges.forEach(edge => {
            var splineMesh = edge.mesh;
            var position = splineMesh.geometry.attributes.position;
            for (var i = 0; i < this.ARC_SEGMENTS; i++) {
                var t = i / (this.ARC_SEGMENTS - 1);
                edge.getPoint(t, this.point);
                position.setXYZ(i, this.point.x, this.point.y, this.point.z);
            }
            position.needsUpdate = true;
        });
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
        // 实体始终面对摄像机
        this.nodes.forEach(obj => {
            obj.lookAt(this.camera.position);
        });
        // this.stats.update();
    };

    renderFun = () => {
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
        this.transformControl.addEventListener('dragging-changed', event => {
            if (this.orbitControls) {
                this.orbitControls.enabled = !event.value;
            }
        });
        this.scene.add(this.transformControl);
        this.transformControl.addEventListener('change', e => {
            this.cancelHideTransform();
        });
        this.transformControl.addEventListener('mouseDown', () => {
            this.cancelHideTransform();
        });
        this.transformControl.addEventListener('mouseUp', () => {
            this.delayHideTransform();
        });
        this.transformControl.addEventListener('objectChange', e => {
            this.updateSplineOutline();
        });
    };

    addDragControls = () => {
        var dragcontrols = new DragControls(this.nodes, this.camera, this.renderer.domElement); //
        dragcontrols.enabled = false;
        dragcontrols.addEventListener('hoveron', event => {
            this.dragingNode = event.object;
            this.transformControl.attach(event.object);
            this.cancelHideTransform();
        });

        dragcontrols.addEventListener('hoveroff', () => {
            this.delayHideTransform();
        });
    };

    sphereLayout = (data, options) => {
        const nodes = data.nodes.map(node => {
            let u = 0;
            let v = 0;
            let r = 20;
            while (v * v + u * u > r * r || (u === 0 && v === 0)) {
                u = Math.random() * 2 * r - r;
                v = Math.random() * 2 * r - r;
            }
            const x = 2 * u * Math.sqrt(r * r - v * v - u * u);
            const y = 2 * v * Math.sqrt(r * r - v * v - u * u);
            const z = r - 2 * (v * v + u * u);
            return {
                ...node,
                x,
                y,
                z,
            };
        });
        return { ...data, nodes };
    };

    renderEdge = data => {
        this.edges = [];

        data.edges.forEach(item => {
            const { source, target, id } = item;
            const sourceNode = this.nodes.find(obj => obj.userData.id === source);
            const targetNode = this.nodes.find(obj => obj.userData.id === target);
            var geometry = new THREE.BufferGeometry();
            geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3)
            );
            let curve = new THREE.CatmullRomCurve3([sourceNode.position, targetNode.position]);
            curve.curveType = 'chordal';
            curve.mesh = new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                    color: 0x0000ff,
                    opacity: 0.35,
                })
            );
            curve.mesh.castShadow = true;
            curve.mesh.visible = true;
            curve.mesh.userData = {
                ...item,
                targetNode,
                sourceNode,
            };
            this.scene.add(curve.mesh);
            this.edges.push(curve);
        });
        this.updateSplineOutline();
    };

    addLight = () => {
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
    };

    addPlane = () => {
        var planeGeometry = new THREE.PlaneBufferGeometry(2000, 2000);
        planeGeometry.rotateX(-Math.PI / 2);
        var planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });

        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.y = -200;
        plane.receiveShadow = true;
        this.scene.add(plane);
    };

    addGridHelper = () => {
        var helper = new THREE.GridHelper(2000, 100);
        helper.position.y = -199;
        helper.material.opacity = 0.25;
        helper.material.transparent = true;
        this.scene.add(helper);
    };

    addArrowHelper = () => {
        var dir = new THREE.Vector3(1, 2, 0);
        dir.normalize();
        var origin = new THREE.Vector3(0, 0, 0);
        var length = 1;
        var hex = 0xffff00;

        var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
        this.scene.add(arrowHelper);
    };

    init = data => {
        const time = new Date().getTime();
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
        this.addLight();
        // 地面阴影
        this.addPlane();
        // 网格
        this.addGridHelper();
        //arrow
        this.addArrowHelper();

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
        // for (var i = 0; i < this.splinePointsLength; i++) {
        //     this.addNode(this.positions[i]);
        // }
        data.nodes.forEach(node => {
            this.addNode(node);
        });
        /**
         * 渲染边
         */
        this.renderEdge(data);
        console.log(new Date().getTime() - time);
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
