import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import {hasAndroidPermission} from '../components/Parmition';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAppDispatch, useAppSelector} from '../Redux/hooks';
import {
  addFavorite,
  removeFavorite,
} from '../Redux/features/favorite/favoriteSlice';
import Header from '../components/Header';

const Gallery = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [images, setImages] = useState([] as any);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const dispatch = useAppDispatch();
  const favorite = useAppSelector(state => state.favorite as string[]);

  useEffect(() => {
    const loadImages = async () => {
      const permissionGranted = await hasAndroidPermission();
      if (permissionGranted) {
        CameraRoll.getPhotos({
          first: 20,
          assetType: 'Photos',
        })
          .then(r => {
            setImages(
              r.edges.map(p => {
                return p.node;
              }),
            );
          })
          .catch(err => {
            //Error Loading Images
          });
      }
    };
    loadImages();
  }, []);

  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    if (isFavorite) {
      dispatch(removeFavorite(id));
    } else {
      dispatch(addFavorite(id));
    }
  };
  const renderItem = ({item, index}: any) => {
    const isFavorite = favorite.some(image => image === item.id);
    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => {
          setSelectedImageIndex(index);
          setIsVisible(true);
        }}>
        <Image source={{uri: item.image.uri}} style={styles.image} />
        <TouchableOpacity
          style={styles.favorite}
          onPress={() => handleFavoriteToggle(item.id, isFavorite)}>
          <Icon
            style={styles.love}
            name="favorite"
            size={30}
            color={isFavorite ? 'red' : 'gray'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Header />
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id}
        numColumns={3}
      />
      <ImageView
        images={images.map((img: {image: any; uri: string}) => ({
          uri: img.image.uri,
        }))}
        imageIndex={selectedImageIndex}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    margin: 5,
  },
  image: {
    width: 'auto',
    height: 130,
  },
  favorite: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  love: {
    padding: 5,
  },
});

export default Gallery;
