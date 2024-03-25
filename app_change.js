import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RNCamera } from 'react-native-camera';
import axios from 'axios';

const App = () => {
  const [resultImage, setResultImage] = useState('');
  const [boundingBox, setBoundingBox] = useState([]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const { status } = await RNCamera.requestPermissionsAsync();
        if (status === 'granted') {
          // 카메라 권한이 허용되면 카메라를 시작합니다.
          // ...
        }
      } catch (error) {
        console.error('카메라를 시작할 수 없습니다.', error);
      }
    };
    startCamera();
  }, []);

  const processImage = async (imageData) => {
    try {
      const response = await axios.post('http://your-flask-server-ip:8080/process_image', {
        image_data: imageData,
      });
      setResultImage(response.data.result_image);
      setBoundingBox(response.data.bounding_box);
    } catch (error) {
      console.error('이미지 처리 중 오류 발생', error);
    }
  };

  const handleCapture = async () => {
    if (cameraRef) {
      const { uri } = await cameraRef.takePictureAsync();
      // uri를 base64 형태로 변환하고 Flask 서버로 전송합니다.
      // ...
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={(ref) => {
          cameraRef = ref;
        }}
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.off}
      />
      <View style={styles.resultContainer}>
        <Image source={{ uri: resultImage }} style={styles.resultImage} />
        <View style={[styles.boundingBox, { left: boundingBox[0], top: boundingBox[1], width: boundingBox[2], height: boundingBox[3] }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  resultContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  resultImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'red',
  },
});

export default App;
