import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';


// function PointCloud({ url }) {
//   const pointCloudRef = useRef();
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

//   // Load the PLY file and create the point cloud
//   useEffect(() => {
//     const loader = new PLYLoader();
//     loader.load(url, (geometry) => {
//       const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
//       const points = new THREE.Points(geometry, material);
//       pointCloudRef.current.add(points);

//       pointCloudRef.current.scale.set(1.5, 1.5, 1.5);
//     });
//   }, [url]);

//   // Track mouse movement
//   useEffect(() => {
//     const handleMouseMove = (event) => {
//       setMousePos({
//         x: event.clientX,
//         y: event.clientY,
//       });
//     };

//     window.addEventListener('mousemove', handleMouseMove);

//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//     };
//   }, []);

//   // Rotate the point cloud based on mouse movement
//   useFrame(() => {
//     if (pointCloudRef.current) {
//       const deltaMove = mousePos.x - window.innerWidth / 2; // Calculate the delta movement
//       const rotationSpeed = 0.01; // Speed of rotation
//       pointCloudRef.current.rotation.z += (deltaMove * rotationSpeed) / 1000; // Apply rotation
//     }
//   });

//   return <group ref={pointCloudRef} />;
// }

function PointCloud({ url }) {
  const pointCloudRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });

  // Load the PLY file and create the point cloud
  useEffect(() => {
    const loader = new PLYLoader();
    loader.load(url, (geometry) => {
      const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
      const points = new THREE.Points(geometry, material);
      pointCloudRef.current.add(points);
      pointCloudRef.current.rotation.x = -Math.PI / 2;

      // Scale the point cloud
      pointCloudRef.current.scale.set(1.5, 1.5, 1.5); // Adjust the scale values as needed
    });
  }, [url]);

  // Handle mouse down event
  const handleMouseDown = (event) => {
    setIsDragging(true);
    setStartMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleTouchStart = (event) => {
    setIsDragging(true);
    const touch = event.touches[0]; // Get the first touch point
    setStartMousePos({ x: touch.clientX, y: touch.clientY });
  };

  // Handle mouse move event
  const handleMouseMove = (event) => {
    if (isDragging) {
      const deltaX = event.clientX - startMousePos.x;
      const deltaY = event.clientY - startMousePos.y;

      const sensitivity = 0.0001

      // Rotate around Y-axis for horizontal drag
      pointCloudRef.current.rotation.z += deltaX * sensitivity; // Adjust rotation speed as needed

      // Rotate around X-axis for vertical drag
      pointCloudRef.current.rotation.x += deltaY * sensitivity; // Adjust rotation speed as needed

      // Update the starting mouse position for the next frame
      setStartMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleTouchMove = (event) => {
    if (isDragging) {
      const touch = event.touches[0]; // Get the first touch point
      const deltaX = touch.clientX - startMousePos.x;
      const deltaY = touch.clientY - startMousePos.y;

      // Adjust the sensitivity factor
      const sensitivity = 0.005; // Lower value for less sensitivity

      // Rotate around Y-axis for horizontal drag
      pointCloudRef.current.rotation.y += deltaX * sensitivity;

      // Rotate around X-axis for vertical drag
      pointCloudRef.current.rotation.x += deltaY * sensitivity;

      // Update the starting mouse position for the next frame
      setStartMousePos({ x: touch.clientX, y: touch.clientY });
    }
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]); // for removing warning: [isDragging, handleMouseMove, handleTouchMove]

  return <group ref={pointCloudRef} />;
}

function App() {
  return (
    <Canvas style={{ height: '100vh', background: '#7E00F4' }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <PointCloud url="/assets/test_pcd.ply" />
    </Canvas>
  );
}

export default App;
