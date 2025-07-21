export const mockChats = [
  {
    id: 1,
    name: "Maria Silva",
    lastMessage: "Oi! Como você está?",
    time: "14:30",
    unread: 2,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b892?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
    messages: [
      {
        id: 1,
        text: "Oi! Como você está?",
        sender: "Maria Silva",
        time: "14:30",
        isOwn: false
      },
      {
        id: 2,
        text: "Oi Maria! Estou bem, e você?",
        sender: "Você",
        time: "14:31",
        isOwn: true
      }
    ]
  },
  {
    id: 2,
    name: "João Santos",
    lastMessage: "Vamos marcar aquele encontro",
    time: "13:45",
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    isOnline: false,
    messages: [
      {
        id: 1,
        text: "Vamos marcar aquele encontro",
        sender: "João Santos",
        time: "13:45",
        isOwn: false
      },
      {
        id: 2,
        text: "Claro! Que tal amanhã?",
        sender: "Você",
        time: "13:46",
        isOwn: true
      },
      {
        id: 3,
        text: "Perfeito! Às 19h no café da esquina",
        sender: "João Santos",
        time: "13:47",
        isOwn: false
      }
    ]
  },
  {
    id: 3,
    name: "Ana Costa",
    lastMessage: "Obrigada pela ajuda hoje! 😊",
    time: "12:20",
    unread: 1,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
    messages: [
      {
        id: 1,
        text: "Conseguiu terminar o projeto?",
        sender: "Você",
        time: "11:30",
        isOwn: true
      },
      {
        id: 2,
        text: "Sim! Graças à sua ajuda",
        sender: "Ana Costa",
        time: "12:15",
        isOwn: false
      },
      {
        id: 3,
        text: "Obrigada pela ajuda hoje! 😊",
        sender: "Ana Costa",
        time: "12:20",
        isOwn: false
      }
    ]
  },
  {
    id: 4,
    name: "Grupo Família",
    lastMessage: "Pedro: Vai ter churrasco no domingo!",
    time: "11:15",
    unread: 5,
    avatar: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&h=150&fit=crop&crop=faces",
    isGroup: true,
    isOnline: false,
    messages: [
      {
        id: 1,
        text: "Pessoal, como foi o dia de vocês?",
        sender: "Mãe",
        time: "10:30",
        isOwn: false
      },
      {
        id: 2,
        text: "Tudo bem aqui! Trabalhando muito",
        sender: "Você",
        time: "10:45",
        isOwn: true
      },
      {
        id: 3,
        text: "Vai ter churrasco no domingo!",
        sender: "Pedro",
        time: "11:15",
        isOwn: false
      }
    ]
  },
  {
    id: 5,
    name: "Carlos Oliveira",
    lastMessage: "Documento enviado por email",
    time: "09:30",
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    isOnline: false,
    messages: [
      {
        id: 1,
        text: "Bom dia! Precisa do relatório hoje?",
        sender: "Carlos Oliveira",
        time: "09:00",
        isOwn: false
      },
      {
        id: 2,
        text: "Bom dia Carlos! Sim, pode enviar quando puder",
        sender: "Você",
        time: "09:15",
        isOwn: true
      },
      {
        id: 3,
        text: "Documento enviado por email",
        sender: "Carlos Oliveira",
        time: "09:30",
        isOwn: false
      }
    ]
  }
];

export const currentUser = {
  name: "Você",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
};