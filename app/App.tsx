import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {GLView} from 'expo-gl';
import {Renderer, THREE} from 'expo-three'; // LATEST
import {Gyroscope} from 'expo-sensors';

export default function App() {
    const timeoutRef = useRef();
    const gyroInterval = 10; // Update interval in milliseconds
    const gyroDataRef = useRef({x: 0, y: 0, z: 0});

    useEffect(() => {
        Gyroscope.setUpdateInterval(gyroInterval);
        const sub = Gyroscope.addListener(data => {
            const {x, y, z} = gyroDataRef.current;
            gyroDataRef.current = {
                x: x + data.x / 1000 * gyroInterval,
                y: y + data.y / 1000 * gyroInterval,
                z: z + data.z / 1000 * gyroInterval
            };
        });
        return () => sub.remove();
    }, []);

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current); // Clean up on unmount
    }, []);

    const onContextCreate = async (gl) => {
        const {drawingBufferWidth: width, drawingBufferHeight: height} = gl;

        // Set up renderer
        const renderer = new Renderer({gl});
        renderer.setSize(width, height);
        renderer.setClearColor('#000000');

        // Create scene and camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 2;

        // Add cube
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshNormalMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);


        // Animation loop
        const render = () => {
            timeoutRef.current = requestAnimationFrame(render);

            // Rotate the cube based on gyroscope data
            const {x, y, z} = gyroDataRef.current;
            mesh.rotation.x = x;
            mesh.rotation.y = y;
            mesh.rotation.z = z;

            renderer.render(scene, camera);
            gl.endFrameEXP();
        };

        render();
    };

    return (
        <View style={{flex: 1}}>
            <GLView style={{flex: 1}} onContextCreate={onContextCreate}/>
        </View>
    );
}
