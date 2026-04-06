const fs = require('fs')
const pt = require('./messages/pt.json')
const es = require('./messages/es.json')

const searchPagePt = {
  exploreProfessionals: 'Explorar Profissionais',
  meta: {
    title: 'Psicólogos Online | Terapia',
    description: 'Encontre o psicólogo ideal para você. Mais de 100 especialistas verificados.',
  },
  header: {
    titlePart1: 'Encontramos',
    titlePart2: '{count}',
    titlePart3: 'profissionais para você',
  },
  sort: {
    label: 'Ordenar por:',
    placeholder: 'Relevância',
    relevance: 'Relevância',
    priceAsc: 'Menor preço',
    priceDesc: 'Maior preço',
  },
  filters: {
    title: 'Filtros',
    description: 'Refine sua busca para encontrar o psicólogo ideal.',
    clear: 'Limpar Tudo',
    quickSearch: 'Busca Rápida',
    searchPlaceholder: 'Nome, abordagens...',
    specialties: 'Especialidades',
    insurances: 'Planos de Saúde',
    noInsurances: 'Nenhum plano',
    investment: 'Investimento Máximo',
    upTo: 'Até {amount}',
    gender: 'Gênero',
    female: 'Feminino',
    male: 'Masculino',
    moreComingSoon: 'Mais filtros em breve!',
  },
  empty: {
    title: 'Nenhum resultado',
    description: 'Tente ajustar seus filtros para encontrar o que precisa.',
    button: 'Limpar Filtros',
  },
  loadingMore: 'Carregando...',
  card: {
    fallbackName: 'Usuário',
    notInformed: 'Não informado',
    fallbackBio: 'Sem descrição.',
    new: 'Novo',
    online: 'Online',
    brazil: 'Brasil',
    sessionDuration: 'Valor da sessão',
    viewProfile: 'Ver Perfil',
  },
}

const searchPageEs = {
  exploreProfessionals: 'Explorar Profesionales',
  meta: {
    title: 'Psicólogos Online | Terapia',
    description: 'Encuentra el psicólogo ideal para ti.',
  },
  header: {
    titlePart1: 'Encontramos',
    titlePart2: '{count}',
    titlePart3: 'profesionales para ti',
  },
  sort: {
    label: 'Ordenar por:',
    placeholder: 'Relevancia',
    relevance: 'Relevancia',
    priceAsc: 'Menor precio',
    priceDesc: 'Mayor precio',
  },
  filters: {
    title: 'Filtros',
    description: 'Refina tu búsqueda.',
    clear: 'Limpiar Todo',
    quickSearch: 'Búsqueda Rápida',
    searchPlaceholder: 'Nombre, enfoques...',
    specialties: 'Especialidades',
    insurances: 'Planes',
    noInsurances: 'Ningún plan',
    investment: 'Inversión Máxima',
    upTo: 'Hasta {amount}',
    gender: 'Género',
    female: 'Femenino',
    male: 'Masculino',
    moreComingSoon: '¡Más filtros pronto!',
  },
  empty: {
    title: 'Ningún resultado',
    description: 'Intenta ajustar tus filtros.',
    button: 'Limpiar Filtros',
  },
  loadingMore: 'Cargando...',
  card: {
    fallbackName: 'Usuario',
    notInformed: 'No informado',
    fallbackBio: 'Sin descripción.',
    new: 'Nuevo',
    online: 'Online',
    brazil: 'Brasil',
    sessionDuration: 'Valor de la sesión',
    viewProfile: 'Ver Perfil',
    noTimes: 'Sin horarios',
  },
}

pt.SearchPage = searchPagePt
es.SearchPage = searchPageEs

fs.writeFileSync('./messages/pt.json', JSON.stringify(pt, null, 2))
fs.writeFileSync('./messages/es.json', JSON.stringify(es, null, 2))

console.log('Appended safely!')
