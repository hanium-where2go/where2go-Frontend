import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  View,
  TextInput,
  Text,
  StyleSheet,
  Modal,
  Image,
  Pressable,
} from 'react-native';
import NaverMapView, {Marker} from 'react-native-nmap';
import Geolocation from '@react-native-community/geolocation';
import Filter1 from '../components/Filter1';
import Filter2 from '../components/Filter2';
import Filter3 from '../components/Filter3';
import Filter4 from '../components/Filter4';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppDispatch} from '../store';
import storeMapSlice from '../slices/storeMap';
import storeModalSlice from '../slices/storeModal';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import {useSelector} from 'react-redux';
import {RootState} from '../store/reducer';
import StoreModal from '../components/StoreModal';

/*
 * 핵심 메인 화면
 * [Redux] storeMap, storeModal, user 슬라이스
 *  - storeMap: 지도 화면으로 넘어왔을 때 사용자 기반으로 보여주는 주점과 검색 주점을 찾을 수 있도록 하였음.
 *              서버에서 보내주는 데이터 형식과 'react-native-nmap'에서 활용하는 마커의 요청 형식이 달라 map을 통해 데이터 저장되도록 함.
 *  - storeModal: storeModal 보여주기 여부 설정.
 *  - user: 본인이 작업하지 않아 accessToken 추가할 수 있도록 현재는 주석처리만 해둠.
 * 통신 로직 구현을 위해 적어둔 부분, 아직 적용 못함.
 * useEffect를 통해 작성해둔 더미 데이터를 보기 위해서는 코드 수정(띄어쓰기도 가능) 후 저장 -> reload를 하면 테스트 데이터 확인 가능.
 * [수정 못한 오류]
 *  1. 마커 표시가 깜빡이는 문제('react-native-nmap'의 문제로 확인.)
 *  2. map 형태로 데이터를 저장해서인지 index 오류 발생. 현재는 index오류 대신 2번 StoreModal이 출력되어 확인은 가능하도록 함.
 */

function StoreMap() {
  const dispatch = useAppDispatch();
  const accessToken = 'accessToken';
  //useSelector((state: RootState) => state.user.accessToken);
  const storeList = useSelector(
    (state: RootState) => state.storeMap.defaultStores,
  );
  const searchStoreList = useSelector(
    (state: RootState) => state.storeMap.searchStores,
  );
  const storeModal = useSelector(
    (state: RootState) => state.storeModal.detailVisible,
  );

  //현재 위치
  const [myPosition, setMyPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  //필터링
  const [numberVisible, setNumberVisible] = useState(false);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [liquorVisible, setLiquorVisible] = useState(false);
  const [favorLocation, setFavorLocation] = useState(false);

  //모든 주점 위치 ▶ markers에 초기 데이터 값 안 들어가고 있음. 추후 확인.
  const [markers, setMarkers] = useState('');
  //검색창
  const [searchWord, setSearchWord] = useState('');

  //현재 위치 정보 불러오기
  useEffect(() => {
    Geolocation.getCurrentPosition(
      info => {
        setMyPosition({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        });
      },
      //20초 안에 못 불러오면 에러
      console.error,
      {
        enableHighAccuracy: true,
        timeout: 20000,
      },
    );
  }, []);

  //사용자 위치정보 기반 등록된 지점 보여주기
  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const loadStore = async () => {
      try {
        // const response = await axios.post(`${Config.API_URL}/store`, {
        //   //request 정보
        //   headers: {authorization: `Bearer ${accessToken}`},
        // });
        // console.log(response);

        //더미 데이터
        const response = [
          {
            restaurant_id: 1,
            restaurant_name: '테스트1',
            latitude: 37.497175,
            longitude: 127.029099,
          },
          {
            restaurant_id: 2,
            restaurant_name: '테스트2',
            latitude: 37.497175,
            longitude: 127.027926,
          },
        ];
        dispatch(storeMapSlice.actions.setStore(response));
        console.log('storeList입니다!!!', storeList);
        setMarkers(storeData);
      } catch (error) {
        console.error(error);
        if ((error as AxiosError).response?.data.code === '400') {
          Alert.alert(
            '알림',
            '가게 정보를 불러오지 못했습니다. 통신 상태 확인 후 다시 한번 시도해주세요.',
          );
        }
      }
    };
    loadStore();
  }, [dispatch]);

  if (!myPosition || !myPosition.latitude) {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
        <Text>내 위치를 로딩 중입니다. 권한을 허용했는지 확인해주세요.</Text>
      </View>
    );
  }

  const searchStore = async () => {
    try {
      // const response = await axios.post(`${Config.API_URL}/store`, {
      //   //request 정보
      //   headers: {authorization: `Bearer ${accessToken}`},
      // });
      // console.log(response);

      //더미 데이터
      const response = [
        {
          restaurant_id: 1,
          restaurant_name: '서칭1',
          latitude: 37.497175,
          longitude: 127.027299,
        },
        {
          restaurant_id: 2,
          restaurant_name: '서칭2',
          latitude: 37.497175,
          longitude: 127.027926,
        },
      ];
      dispatch(storeMapSlice.actions.setSearchStore(response));
      console.log('~~~~~~searchStoreList!!!', searchStoreList);
      const searchData = searchStoreList[0].map((store: any) => {
        return {
          id: store.restaurant_id,
          title: store.restaurant_name,
          coordinate: {
            latitude: store.latitude,
            longitude: store.longitude,
          },
        };
      });
      console.log('~~~~~~ searchData입니다', searchData);
      setMarkers(searchData);
    } catch (error) {
      console.error(error);
      if ((error as AxiosError).response?.data.code === '400') {
        Alert.alert(
          '알림',
          '가게 정보를 불러오지 못했습니다. 통신 상태 확인 후 다시 한번 시도해주세요.',
        );
      }
    }
  };

  //마커 형식에 맞게 data 매핑해서 받아옴.
  const storeData = storeList[0].map((store: any) => {
    return {
      id: store.restaurant_id,
      title: store.restaurant_name,
      coordinate: {latitude: store.latitude, longitude: store.longitude},
    };
  });

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.header__inputBox}>
            <TextInput
              style={styles.header__input}
              placeholder="검색할 내용을 입력해 주세요."
              onChangeText={(text): void => setSearchWord(text)}
            />
          </View>
          <Pressable
            style={{flex: 1}}
            onPress={(): void => {
              searchStore();
              // axiosInstance
              //   .post('houses/search', {
              //     searchWord,
              //   })
              //   .then(res => {
              //     const searchHouse = res.data.map((house: any) => {
              //       return {
              //         id: house.id,
              //         title: house.title,
              //         coordinate: {
              //           latitude: Number(house.location[0]),
              //           longitude: Number(house.location[1]),
              //         },
              //       };
              //     });
              //     setMarkers(searchHouse);
              //   });
            }}>
            <Image
              style={styles.header__btnSearch}
              source={require('../assets/mapIcon/icon_search.png')}
            />
          </Pressable>
        </View>
        <View style={styles.filterBox}>
          <Pressable onPress={() => setNumberVisible(true)}>
            <Text style={styles.filterBox__textStyle}>인원수</Text>
          </Pressable>
          <Modal visible={numberVisible} transparent statusBarTranslucent>
            <Filter1 setNumberVisible={setNumberVisible} />
          </Modal>
          <Pressable onPress={() => setCategoryVisible(true)}>
            <Text style={styles.filterBox__textStyle}>주점 종류</Text>
          </Pressable>
          <Modal visible={categoryVisible} transparent statusBarTranslucent>
            <Filter2 setCategoryVisible={setCategoryVisible} />
          </Modal>
          <Pressable onPress={() => setLiquorVisible(true)}>
            <Text style={styles.filterBox__textStyle}>주종</Text>
          </Pressable>
          <Modal visible={liquorVisible} transparent statusBarTranslucent>
            <Filter3 setLiquorVisible={setLiquorVisible} />
          </Modal>
          <Pressable onPress={() => setFavorLocation(true)}>
            <Text style={styles.filterBox__textStyle}>선호 지역</Text>
          </Pressable>
          <Modal visible={favorLocation} transparent statusBarTranslucent>
            <Filter4 setFavorLocation={setFavorLocation} />
          </Modal>
        </View>
        <Pressable
          style={styles.reservation}
          onPress={() => Alert.alert('예약 현황')}>
          <Text style={styles.reservation__textStyle}>예약 현황</Text>
          <Text style={styles.reservation__textStyle}> {`>`} </Text>
        </Pressable>
        <NaverMapView
          style={styles.mapContainer}
          zoomControl={false}
          center={{
            zoom: 16,
            tilt: 10,
            latitude: myPosition.latitude,
            longitude: myPosition.longitude,
          }}>
          {console.log('storeData입니다', storeData)}
          {console.log('==============markerData', markers)}
          {console.log('==============================', storeModal)}
          {markers &&
            markers.map(
              (store: {
                id: number;
                title: string;
                coordinate: {latitude: number; longitude: number};
              }) => (
                <Marker
                  key={store.id}
                  coordinate={store.coordinate}
                  width={30}
                  height={30}
                  anchor={{x: 0.5, y: 0.5}}
                  caption={{text: store.title}}
                  image={require('../assets/mapIcon/icon_location.png')}
                  onClick={(): void => {
                    dispatch(storeModalSlice.actions.setDetailVisible());
                    console.log('clicked', storeModal);
                  }}>
                  {!storeModal ? (
                    <Image
                      style={{width: 30, height: 30}}
                      source={require('../assets/mapIcon/icon_location.png')}
                    />
                  ) : (
                    <Modal
                      animationType="fade"
                      visible={storeModal}
                      transparent>
                      <StoreModal />
                    </Modal>
                  )}
                </Marker>
              ),
            )}
        </NaverMapView>
        <View style={styles.currentStatus}>
          <Pressable
            onPress={() => {
              setMyPosition({
                latitude: myPosition.latitude - 0.00000000001, //카메라 이동(임시)
                longitude: myPosition.longitude,
              });
            }}>
            <Image
              style={styles.currentStatus__btnStatus}
              source={require('../assets/mapIcon/icon_current_location.png')}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  header__inputBox: {
    height: Dimensions.get('window').height / 11,
    backgroundColor: '#fff',
    flex: 9,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  header__input: {
    backgroundColor: '#F2F2F2',
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 15,
    fontSize: 14,
  },
  header__btnSearch: {
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    flex: 1,
    resizeMode: 'contain',
  },
  filterBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },
  filterBox__textStyle: {
    fontSize: 14,
    padding: 10,
  },
  reservation: {
    flexDirection: 'row',
    backgroundColor: '#4E6D5E',
    justifyContent: 'flex-end',
    padding: 5,
  },
  reservation__textStyle: {
    color: 'white',
  },
  mapContainer: {
    width: '100%',
    height: '100%',
  },
  currentStatus: {
    position: 'absolute',
    top: Dimensions.get('window').height * 0.85,
    alignSelf: 'auto',
  },
  currentStatus__btnStatus: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
});

export default StoreMap;
