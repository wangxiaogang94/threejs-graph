import React, { useEffect } from 'react';
import * as THREE from 'three';

const Grid = () => {
    useEffect(() => {
        var width = document.getElementById('canvas-frame').clientWidth;
        var height = document.getElementById('canvas-frame').clientHeight;
        var scene = new THREE.Scene(); // 场景
        var camera = new THREE.PerspectiveCamera(45, width / height, 1, 500); // 透视相机
        camera.position.set(0, 0, 100);
        camera.lookAt(0, 0, 0);

        for (let index = 0; index < 20; index++) {
            var p1 = new THREE.Vector3(-100 + 10 * index, 100, 0);

            var p2 = new THREE.Vector3(-100 + 10 * index, -100, 0);
    
            var geometry = new THREE.Geometry();
    
            geometry.vertices.push(p1);
    
            geometry.vertices.push(p2);
    
            var material = new THREE.LineBasicMaterial({ color: 0x0000ff, opacity: 0.2 });
    
            var line = new THREE.Line(geometry, material, THREE.LineSegments);
    
            scene.add(line);
            
        }
        for (let index = 0; index < 20; index++) {
            var p1 = new THREE.Vector3(100,-100 + 10 * index, 0);

            var p2 = new THREE.Vector3(-100,-100 + 10 * index, 0);
    
            var geometry = new THREE.Geometry();
    
            geometry.vertices.push(p1);
    
            geometry.vertices.push(p2);
    
            var material = new THREE.LineBasicMaterial({ color: 0x0000ff, opacity: 0.2 });
    
            var line = new THREE.Line(geometry, material, THREE.LineSegments);
    
            scene.add(line);
            
        }
        //---------------
 

        var renderer = new THREE.WebGLRenderer(); // 渲染器
        renderer.setSize(width, height); // 设置容器大小
        document.getElementById('canvas-frame').appendChild(renderer.domElement); // 挂载

        renderer.render(scene, camera); // 渲染
    }, []);

    return <div id="canvas-frame" style={{ height: '100vh' }}></div>;
};

export default Grid;
