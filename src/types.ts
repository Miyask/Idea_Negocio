export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Flow {
  id: string;
  userId: string;
  name: string;
  status: 'Activo' | 'Pausado' | 'Configurando';
  lastRun: string;
  type: string;
}

export interface Activity {
  id: string;
  userId: string;
  title: string;
  time: string;
  type: string;
  status: string;
}
