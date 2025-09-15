import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, StyleProp, TextStyle, Alert } from "react-native";
import { ReservationCard, ReservationCardProps } from "./ReservationCard";
import { fetchAPI } from "../screens/services/api";

export type BackendResponse = ReservationCardProps[];

async function backendPlaceholder(): Promise<BackendResponse> 
{
    try
    {
        const data : BackendResponse = await fetchAPI('/reservas');
        return data;
    }
    catch (err: any)
    {
        console.error('Error fetching reservations:', err);
        Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
        return [];
    }
    
}
interface ReservationBodyProps 
{
    styleTitle?: StyleProp<TextStyle>;
    userId: number;
    isSyndic: boolean;
}
export const ReservationBody: React.FC<ReservationBodyProps> = ({ styleTitle , userId, isSyndic }) =>
{
    const [reservations, setReservations] = useState<ReservationCardProps[]>([]);

    useEffect(() => 
    {
        backendPlaceholder().then(setReservations);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={[styles.title, styleTitle]}>Reservas</Text>
            {reservations.map((reservation, index) => (
                <ReservationCard 
                    key={index}
                    {...reservation}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    width: "100%"
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    color: "#0058A3"
  }
});