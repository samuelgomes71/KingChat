export const mockChats = [
  {
    id: 1,
    name: "Maria Silva",
    lastMessage: "Oi! Como você está?",
    time: "14:30",
    unread: 2,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b892?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
    type: "private",
    messages: [
      {
        id: 1,
        text: "Oi! Como você está?",
        sender: "Maria Silva",
        time: "14:30",
        isOwn: false,
        canEdit: false,
        isForwarded: false
      },
      {
        id: 2,
        text: "Oi Maria! Estou bem, e você?",
        sender: "Você",
        time: "14:31",
        isOwn: true,
        canEdit: true,
        isForwarded: false
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
    type: "private",
    messages: [
      {
        id: 1,
        text: "Vamos marcar aquele encontro",
        sender: "João Santos",
        time: "13:45",
        isOwn: false,
        canEdit: false,
        replyTo: null
      },
      {
        id: 2,
        text: "Claro! Que tal amanhã?",
        sender: "Você",
        time: "13:46",
        isOwn: true,
        canEdit: true,
        replyTo: 1
      },
      {
        id: 3,
        text: "Perfeito! Às 19h no café da esquina",
        sender: "João Santos",
        time: "13:47",
        isOwn: false,
        canEdit: false,
        replyTo: 2
      }
    ]
  },
  {
    id: 3,
    name: "Canal Tech News 📢",
    lastMessage: "Breaking: Nova atualização revolucionária lançada!",
    time: "12:20",
    unread: 1,
    avatar: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=150&h=150&fit=crop",
    isOnline: false,
    type: "channel",
    subscribers: 15420,
    isAdmin: false,
    messages: [
      {
        id: 1,
        text: "🚀 BREAKING: Nova atualização revolucionária do KingChat!",
        sender: "Admin",
        time: "12:00",
        isOwn: false,
        canEdit: false,
        isChannelPost: true
      },
      {
        id: 2,
        text: "✨ Novidades incluem: Bots inteligentes, mensagens programadas e muito mais!",
        sender: "Admin",
        time: "12:15",
        isOwn: false,
        canEdit: false,
        isChannelPost: true
      },
      {
        id: 3,
        text: "Breaking: Nova atualização revolucionária lançada!",
        sender: "Admin",
        time: "12:20",
        isOwn: false,
        canEdit: false,
        isChannelPost: true
      }
    ]
  },
  {
    id: 4,
    name: "Grupo Família 👨‍👩‍👧‍👦",
    lastMessage: "Pedro: Vai ter churrasco no domingo!",
    time: "11:15",
    unread: 5,
    avatar: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&h=150&fit=crop&crop=faces",
    type: "group",
    members: 8,
    isOnline: false,
    messages: [
      {
        id: 1,
        text: "Pessoal, como foi o dia de vocês?",
        sender: "Mãe",
        time: "10:30",
        isOwn: false,
        canEdit: false
      },
      {
        id: 2,
        text: "Tudo bem aqui! Trabalhando muito",
        sender: "Você",
        time: "10:45",
        isOwn: true,
        canEdit: true
      },
      {
        id: 3,
        text: "Vai ter churrasco no domingo!",
        sender: "Pedro",
        time: "11:15",
        isOwn: false,
        canEdit: false
      }
    ]
  },
  {
    id: 5,
    name: "🤖 AssistentBot",
    lastMessage: "Como posso ajudar você hoje?",
    time: "09:30",
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
    type: "bot",
    botCommands: ["/help", "/weather", "/news", "/joke"],
    messages: [
      {
        id: 1,
        text: "Olá! Sou seu assistente pessoal do KingChat 🤖",
        sender: "AssistentBot",
        time: "09:00",
        isOwn: false,
        canEdit: false,
        isBot: true
      },
      {
        id: 2,
        text: "Como posso ajudar você hoje?",
        sender: "AssistentBot",
        time: "09:30",
        isOwn: false,
        canEdit: false,
        isBot: true,
        quickReplies: ["📰 Notícias", "🌤️ Clima", "😂 Piada", "❓ Ajuda"]
      }
    ]
  },
  {
    id: 6,
    name: "Carlos Oliveira",
    lastMessage: "Documento enviado com segurança 🔒",
    time: "08:15",
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    isOnline: false,
    type: "private",
    hasSecretChat: true,
    messages: [
      {
        id: 1,
        text: "Preciso enviar um documento confidencial",
        sender: "Carlos Oliveira",
        time: "08:00",
        isOwn: false,
        canEdit: false
      },
      {
        id: 2,
        text: "Use o chat secreto para maior segurança",
        sender: "Você",
        time: "08:10",
        isOwn: true,
        canEdit: true
      },
      {
        id: 3,
        text: "Documento enviado com segurança 🔒",
        sender: "Carlos Oliveira",
        time: "08:15",
        isOwn: false,
        canEdit: false,
        isSecret: true,
        selfDestruct: "24h"
      }
    ]
  }
];

export const mockFolders = [
  {
    id: "all",
    name: "Todas as Conversas",
    icon: "💬",
    count: 6
  },
  {
    id: "unread",
    name: "Não Lidas",
    icon: "🔴",
    count: 8
  },
  {
    id: "channels",
    name: "Canais",
    icon: "📢",
    count: 3
  },
  {
    id: "bots",
    name: "Bots",
    icon: "🤖",
    count: 2
  },
  {
    id: "groups",
    name: "Grupos",
    icon: "👥",
    count: 1
  }
];

export const currentUser = {
  name: "Você",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
  isPremium: true
};