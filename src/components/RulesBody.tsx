import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Card } from './Card';

type Rule = {
  str: string;
  date: string;
  creator: string;
};

type BackendResponse = Rule[];

function backendPlaceholder(): Promise<BackendResponse> 
{

    return Promise.resolve([
        {
            str: 'Respeitar o horário de silêncio, das 22h às 8h.',
            date: '10/02/2024',
            creator: 'Pastor Alirio',
        },
        {
            str: 'É proibido jogar lixo ou qualquer objeto pelas janelas ou em áreas comuns.',
            date: '10/02/2024',
            creator: 'Pastor Alirio',
        },
        {
            str: 'As vagas de garagem são de uso exclusivo dos moradores do apartamento correspondente.',
            date: '10/02/2024',
            creator: 'Pastor Alirio',
        },
        {
            str: 'Animais de estimação devem ser mantidos na coleira e acompanhados em todas as áreas comuns.',
            date: '10/02/2024',
            creator: 'Pastor Alirio',
        },
        {
            str: 'A velocidade máxima para veículos dentro do condomínio é de 10 km/h.',
            date: '10/02/2024',
            creator: 'Pastor Alirio',
        },
        {
            str: 'Respeitar e venerar a religião Machado 98, conforme estabelecido na convenção do condomínio.',
            date: '10/02/2024',
            creator: 'Pastor Alirio',
        },
    ]);
}

interface RulesBodyProps 
{
  styleTitle?: StyleProp<TextStyle>;
}

export const RulesBody: React.FC<RulesBodyProps> = ({ styleTitle }) => 
{
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    backendPlaceholder().then(setRules);
  }, []);

  return (
    <View style={styles.container}>

      <Text style={[styles.title, styleTitle]}>Regras do Condomínio</Text>

      {rules.map((rule, index) => (
        
        <Card key={index} title={`Regra #${index + 1}`}>
          <View style={styles.ruleContent}>
            <Text style={styles.ruleText}>"{rule.str}"</Text>
            <Text style={styles.ruleMeta}>
              Criado por: {rule.creator} em {rule.date}
            </Text>
          </View>
        </Card>
      ))
      }
    </View>
  );
};


const styles = StyleSheet.create(
{
  container: 
  {
    width: '100%',
  },
  title: 
  {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0058A3',
  },
  ruleContent: 
  {
    paddingVertical: 4,
  },
  ruleText: 
  {
    fontSize: 15,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  ruleMeta: 
  {
    fontSize: 12,
    color: '#777',
    marginTop: 12,
    textAlign: 'right',
  },
});

export default RulesBody;