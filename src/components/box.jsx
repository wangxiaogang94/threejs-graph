import React from 'react';

import * as THREE from 'three';


// import logo from './logo.svg';
import 'antd/dist/antd.css';



class App extends React.Component {
    camera = null;
    scene = null;
    renderer = null;
    geometry = null;
    material = null;
    mesh = null;
    componentDidMount() {
        const width = document.getElementById('box').clientWidth;
        const height = document.getElementById('box').clientHeight;
        this.init(width,height);
        this.animate();
    }

    init = (width,height) => {
        console.log(' window.clientWidth====', window);
        this.camera = new THREE.PerspectiveCamera( // 透视相机
            70,
            width /height,
            0.01,
            10
        );
        this.camera.position.z = 1;

        this.scene = new THREE.Scene(); // 场景

        this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        this.material = new THREE.MeshNormalMaterial();

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        //线
        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
        var color1 = new THREE.Color(0x444444),
            color2 = new THREE.Color(0xff0000);

        // 线的材质可以由2点的颜色决定
        var p1 = new THREE.Vector3(-10, 0, 10);
        var p2 = new THREE.Vector3(10, 0, -10);
        geometry.vertices.push(p1);
        geometry.vertices.push(p2);
        geometry.colors.push(color1);
        geometry.colors.push(color2);
        var line = new THREE.Line(geometry, material, THREE.LineSegments );
        this.scene.add(line);

        this.renderer = new THREE.WebGLRenderer({ antialias: true }); // 渲染器
        this.renderer.setSize(width,height); // 设置渲染器的大小为窗口的内宽度，也就是内容区的宽度
        document.getElementById('box').appendChild(this.renderer.domElement);
    };

    animate = () => {
        requestAnimationFrame(this.animate);

        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;

        this.renderer.render(this.scene, this.camera);
    };
    render() {
        return (
            <div id="box" style={{border:'1px solid red', width: '100%', height: '100vh'}}>
            </div>
        );
    }
}

export default App;
