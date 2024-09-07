import React, { useRef, useState, useEffect, useMemo  } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { useParams } from 'react-router-dom';
// import three3d from '../assests/3d-view.png';
// import ruler from '../assests/ruler.png';


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
  const [fileUrls, setFileUrls] = useState({
    fileUrl: null,
    torsoUrl: null,
  });
  const [isImageOne, setIsImageOne] = useState(true);

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
  }, [apiEndpoint]);

  useEffect(() => {
    const patterns = {
      outputIB: `/output_IB_${id}.ply`,
      pcd: `/pcd_${id}.ply`,
      torso: `/output_torso_${id}.ply`,
    };

    const findFile = (pattern) => data.find((item) => item.includes(pattern));

    const outputIBFile = findFile(patterns.outputIB);
    const pcdFile = findFile(patterns.pcd);
    const torsoFile = findFile(patterns.torso);

    const baseUrl = 'https://tylmen-life-1.s3.ap-south-1.amazonaws.com/';
    setFileUrls({
      fileUrl: outputIBFile ? `${baseUrl}${outputIBFile}` : (pcdFile ? `${baseUrl}${pcdFile}` : null),
      torsoUrl: torsoFile ? `${baseUrl}${torsoFile}` : null,
    });
  }, [data, id]);

  const finalUrl = useMemo(() => {
    return isImageOne ?   fileUrls.torsoUrl: fileUrls.fileUrl;
  }, [isImageOne, fileUrls]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const toggleImage = () => {
    setIsImageOne(prev => !prev);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#7E00F4]">
      <div className='bg-white rounded-full cursor-pointer w-12 h-12 absolute top-10 flex items-center justify-center transition-transform transform hover:scale-105' onClick={toggleImage}>
        <img src={isImageOne ? "https://i.imgur.com/xARnfU1.png" : "https://i.imgur.com/hhKsjCF.png"} alt="Toggle" width={"40px"} height={"40px"} />
      </div>
      <div className='w-4/5 h-4/5 absolute'>
        <Canvas>
          <ambientLight />
          <pointLight position={[1, 1, 1]} />
          <PointCloud key={finalUrl} url={finalUrl} />
        </Canvas>
      </div>
    </div>
  );
}



export default App;
