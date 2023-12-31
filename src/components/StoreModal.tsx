import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  Text,
  Dimensions,
  Animated,
  PanResponder,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../store/reducer';
import {useAppDispatch} from '../store';
import storeModalSlice from '../slices/storeModal';
import StoreDetail from '../pages/StoreDetail';
import Reservation from '../pages/Reservation';

/*
 * StoreMap(지도, 메인 화면)에서 검색한 주점을 눌렀을 때 나오는 화면.
 * [Redux] storeModal 슬라이스를 통해 보여주기 여부를 설정하였음.
 * Animated.View 활용하여 액션 뷰를 작성하였고, 화면 일정 부분 정도만 나오고 하단으로 내려갈때 액션 들어감.
 * 전체 화면 출력은 '바로 예약' 혹은 '매장 보기' 버튼을 눌렀을 때 페이지 전환 되도록 함.
 */

const StoreModal = () => {
  const dispatch = useAppDispatch();
  const storeModal = useSelector(
    (state: RootState) => state.storeModal.detailVisible,
  );
  const [storeDetail, setStoreDetail] = useState(false);
  const [reservation, setReservation] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const translateY = panY.interpolate({
    // panY에 따라 BottomSheet의 y축 위치를 결정합니다.
    inputRange: [-1, 0, 1], // inputRage의 -1을 outpuRage의 0으로 치환하기 때문에 panY가 0보다 작아져도 BottomSheet의 y축 위치에는 변화가 없습니다.
    outputRange: [0, 0, 1],
  });
  const resetBottomSheet = Animated.timing(panY, {
    // BottomSheet를 초기 위치로 움직이는 함수입니다.
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeBottomSheet = Animated.timing(panY, {
    // BottomSheet를 내리는 함수입니다.
    toValue: screenHeight,
    duration: 300,
    useNativeDriver: true,
  });
  const panResponders = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: (event, gestureState) => {
        // BottomSheet에 터치 또는 드래그 이벤트가 발생할 때 실행됩니다.
        panY.setValue(gestureState.dy); // 처음 터치 영역을 기준으로 y축으로 드래그한 거리를 panY에 저장합니다.
      },
      onPanResponderRelease: (event, gestureState) => {
        // 유저가 BottomSheet 손을 뗐을 때 실행됩니다.
        if (gestureState.dy > 0 && gestureState.vy > 1.5) {
          // 유저가 y축으로 1.5 이상의 속도로 드래그 했을 때 BottomSheet가 닫히도록 조건을 지정했습니다.
          closeModal();
        } else {
          // 위 조건에 부합하지 않으면 BottomSheet의 위치를 초기화 하도록 설계했습니다.
          resetBottomSheet.start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    console.log('prefix StoreModal stauts : ', storeModal);
    if (storeModal) {
      resetBottomSheet.start();
    }
  }, []);

  const closeModal = () => {
    closeBottomSheet.start(() => {
      dispatch(storeModalSlice.actions.setDetailVisible());
    });
  };

  //임의 데이터
  const storeName = '주점 이름';
  const answer = '10';
  const star = '4.5';
  const seat = 4;

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback
        onPress={closeModal} // onPress 이벤트 등록
      >
        <View style={styles.background} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={{
          ...styles.bottomModalContainer,
          transform: [{translateY: translateY}],
        }} // translateY 값을 지정해 BottomSheet의 위치를 조정합니다.
        {...panResponders.panHandlers}>
        <View style={styles.bottomModal__content}>
          <View style={styles.bottomModal__image} />
          <View style={styles.bottomModal__mainContent}>
            <Text style={styles.bottomModal__textStyle}>{storeName}</Text>
            <Text style={styles.bottomModal__textStyle}>
              평균 응답률 : {answer}분 이내
            </Text>
            <Text style={styles.bottomModal__textStyle}>별점 : {star} / 5</Text>
          </View>
        </View>
        <View style={styles.bottomModal__subContent}>
          <Text style={styles.bottomModal__textStyle}>
            예약 가능 좌석 수 : {seat}
          </Text>
          <Text style={{...styles.bottomModal__textStyle, color: '#FECC28'}}>
            [이벤트] 리뷰 작성시 콜라, 사이다 증정
          </Text>
        </View>
        <View style={styles.check}>
          <Pressable
            style={styles.check__btnReservation}
            onPress={() => {
              setReservation(true);
              console.log('[바로예약]', '클릭했습니다.');
            }}>
            <Text style={styles.check__textStyle}>바로 예약</Text>
            <Modal animationType="slide" visible={reservation}>
              <Reservation setReservation={setReservation} />
            </Modal>
          </Pressable>
          <Pressable
            style={styles.check__btnDetail}
            onPress={() => {
              setStoreDetail(true);
              console.log('[매장보기]', '클릭했습니다.');
            }}>
            <Text style={styles.check__textStyle}>매장 보기</Text>
            <Modal animationType="slide" visible={storeDetail}>
              <StoreDetail setStoreDetail={setStoreDetail} />
            </Modal>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomModalContainer: {
    height: 300,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bottomModal__image: {
    backgroundColor: 'gray',
    width: 100,
    height: 100,
  },
  bottomModal__content: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 40,
    marginLeft: 10,
  },
  bottomModal__mainContent: {
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  bottomModal__subContent: {
    flex: 1,
    alignItems: 'flex-start',
    marginTop: 30,
    marginLeft: 10,
  },
  bottomModal__textStyle: {
    fontSize: 20,
    textAlign: 'center',
    margin: 3,
  },
  check: {
    flexDirection: 'row',
    height: '20%',
  },
  check__textStyle: {
    fontSize: 20,
    textAlign: 'center',
    color: 'white',
  },
  check__btnReservation: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#4E6D5E',
  },
  check__btnDetail: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#8DBBA7',
  },
});
export default StoreModal;
