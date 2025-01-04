import { StyleSheet, Text, View, Button } from 'react-native';
import notifee, { AuthorizationStatus, EventType, AndroidImportance, TriggerType } from '@notifee/react-native';
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

  notifee.onBackgroundEvent(async({type, detail}) => {
    const {notification, pressAction} = detail;

    if(type === EventType.PRESS){
      console.log("Tocou na notificação: ", pressAction?.id);
      if(notification?.id){
        await notifee.cancelAllNotifications(notification?.id);
      }
    }

    console.log("Event background.")
  })

  useEffect(() => {
    return notifee.onForegroundEvent(({type, detail}) => {
      switch(type){
        case EventType.DISMISSED:
          console.log("Usuário descartou a notificação");
          break;
        case EventType.PRESS:
          console.log("Tocou: ", detail.notification);
          console.log("Title: ", detail.notification?.title);
          console.log("Corpo: ", detail.notification?.body);
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

  async function handleScheduleNotification() {
    const date = new Date(Date.now());

    date.setMinutes(date.getMinutes() + 1);

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime()
    }

    const notification = await notifee.createTriggerNotification({
      title: "Lembrete Estudo",
      body: "Estudar React Native as 23h",
      android: {
        channelId: 'lembrete',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default'
        }
      }
    }, trigger)

    console.log("Notificação agendada: ", notification);
  }

  function handleListNotifications(){
    notifee.getTriggerNotificationIds()
    .then((ids) => {
      console.log(ids);
    })
  }

  async function handleCancelNotification(){
    await notifee.cancelNotification("GRUE2dgKXy6xj775jGtf");
    console.log("Notificação cancelada com sucesso!");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificações App</Text>
      <View style={styles.buttons}>
        <Button
          title='Enviar notificação'
          onPress={handleNotificate}
        />
        <Button
          title='Agendar notificação'
          onPress={handleScheduleNotification}
        />
        <Button
          title='Listar notificação'
          onPress={handleListNotifications}
        />
        <Button
          title='Cancelar notificação'
          onPress={handleCancelNotification}
        />
      </View>
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
  title: {
    marginBottom:20,
    fontWeight: 'bold'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  }
});
