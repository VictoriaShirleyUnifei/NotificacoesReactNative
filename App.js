import { StyleSheet, Text, View, Button } from 'react-native';
import notifee, { AuthorizationStatus, EventType, AndroidImportance } from '@notifee/react-native';
import { useEffect, useState } from 'react'; 

export default function App() {
  const [statusNotification, setStatusNotification] = useState(true);

  useEffect(() =>{
    async function getPermission() {
      const settings = await notifee.requestPermission();
      if(settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED){
        console.log("Permission: ", settings.authorizationStatus);
        setStatusNotification(true);
      }else {
        console.log("Usuário negou a permissão!");
        setStatusNotification(false);
      }
    }

    getPermission();
  })

  useEffect(() => {
    return notifee.onForegroundEvent(({type, detail}) => {
      switch(type){
        case EventType.DISMISSED:
          console.log("Usuário descartou a notificação");
          break;
        case EventType.PRESS:
          console.log("Tocou: ", detail.notification);
          break;
      }
    })
  }, [])

  async function handleNotificate() {
    if(!statusNotification){
      return;
    }

    const channelId = await notifee.createChannel({
      id: 'lembrete',
      name: 'lembrete',
      vibration: true,
      importance: AndroidImportance.HIGH
    })

    await notifee.displayNotification({
      id: 'lembrete',
      title: 'Estudar programação',
      body: 'Lembrete para estudar react-native amanhã!',
      android:{
        channelId,
        pressAction: {
          id: 'default'
        }
      }
    })
  }

  return (
    <View style={styles.container}>
      <Text>Notificações App</Text>
      <Button 
        title='Enviar notificação'
        onPress={handleNotificate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
