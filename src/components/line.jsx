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
        const width = document.getElementById('line').clientWidth;
        const height = document.getElementById('line').clientHeight;
        this.init(width,height);
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

        //线
        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });
        var color1 = new THREE.Color(0x444444),
            color2 = new THREE.Color(0xff0000);

        // 线的材质可以由2点的颜色决定
        var p1 = new THREE.Vector3(-100, 0, 100);
        var p2 = new THREE.Vector3(100, 0, -100);
        geometry.vertices.push(p1);
        geometry.vertices.push(p2);
        geometry.colors.push(color1);
        geometry.colors.push(color2);
        var line = new THREE.Line(geometry, material, THREE.LineSegments );
        this.scene.add(line);

        this.renderer = new THREE.WebGLRenderer({ antialias: true }); // 渲染器
        this.renderer.setSize(width,height); // 设置渲染器的大小为窗口的内宽度，也就是内容区的宽度
        document.getElementById('line').appendChild(this.renderer.domElement);
    };

    render() {
        return (
            <div id="line" style={{border:'1px solid red', width: '100%', height: '100vh'}}>
            </div>
        );
    }
}

export default App;
