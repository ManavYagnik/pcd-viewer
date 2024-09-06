import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { useParams } from 'react-router-dom';

function PointCloud({ url }) {
  const pointCloudRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loader = new PLYLoader();
    loader.load(url, (geometry) => {
      const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
      const points = new THREE.Points(geometry, material);
      pointCloudRef.current.add(points);
      pointCloudRef.current.rotation.x = -Math.PI / 2;
      pointCloudRef.current.scale.set(4, 4, 4); // Adjust scale
    });
  }, [url]);

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setStartMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const deltaX = event.clientX - startMousePos.x;
      const deltaY = event.clientY - startMousePos.y;
      const sensitivity = 0.0001;
      pointCloudRef.current.rotation.z += deltaX * sensitivity;
      pointCloudRef.current.rotation.x += deltaY * sensitivity;
      setStartMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return <group ref={pointCloudRef} />;
}

function App() {
  const { username, id } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [filename, setFilename] = useState(null);
  const [filename1, setFilename1] = useState(null);

  const apiEndpoint = `http://3.12.41.119:8001/api/bucket_list/?username=${username}_${id}`;

  const fetchData = async () => {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const outputIBPattern = `/output_IB_${id}.ply`;
    const pcdPattern = `/pcd_${id}.ply`;

    const outputIBFile = data.find((item) => item.includes(outputIBPattern));
    const pcdFile = data.find((item) => item.includes(pcdPattern));

    setFilename(outputIBFile || null);
    setFilename1(pcdFile || null);
  }, [data, id]);

  // Update fileUrl state based on filenames
  useEffect(() => {
    if (filename) {
      setFileUrl(`https://tylmen-life-1.s3.ap-south-1.amazonaws.com/${filename}`);
    } else if (filename1) {
      setFileUrl(`https://tylmen-life-1.s3.ap-south-1.amazonaws.com/${filename1}`);
    }
  }, [filename, filename1]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex justify-center items-center h-screen bg-[#7E00F4]">
      <div className='w-4/5 h-4/5'>
        <Canvas>
          <ambientLight />
          <pointLight position={[1, 1, 1]} />
          {fileUrl && <PointCloud url={fileUrl} />}
        </Canvas>
      </div>
    </div>
  );
}

export default App;
