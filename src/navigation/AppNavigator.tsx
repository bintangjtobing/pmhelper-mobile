import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen';
import { TicketsScreen } from '../screens/TicketsScreen';
import { TicketDetailScreen } from '../screens/TicketDetailScreen';
import { TicketCreateScreen } from '../screens/TicketCreateScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { DailyReportFormScreen } from '../screens/DailyReportFormScreen';
import { WeeklyReportFormScreen } from '../screens/WeeklyReportFormScreen';
import { DiscussionsScreen } from '../screens/DiscussionsScreen';
import { DiscussionDetailScreen } from '../screens/DiscussionDetailScreen';
import { UsersScreen } from '../screens/UsersScreen';
import { UserDetailScreen } from '../screens/UserDetailScreen';
import { TabBar } from './TabBar';

export type AppStackParamList = {
  Tabs: undefined;
  ProjectDetail: { projectId: number };
  TicketDetail: { ticketId: number };
  TicketCreate: { projectId: number };
  DailyReportForm: { id?: number };
  WeeklyReportForm: { id?: number };
  DiscussionDetail: { id: number };
  UserDetail: { userId: number };
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, lazy: true }}
    >
      <Tab.Screen name="Home" component={ProjectsScreen} />
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Discussions" component={DiscussionsScreen} />
      <Tab.Screen name="Team" component={UsersScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#12100e' },
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen
        name="TicketCreate"
        component={TicketCreateScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="DailyReportForm"
        component={DailyReportFormScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="WeeklyReportForm"
        component={WeeklyReportFormScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="DiscussionDetail" component={DiscussionDetailScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
    </Stack.Navigator>
  );
}
