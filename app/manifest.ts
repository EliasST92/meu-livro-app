import type { MetadataRoute } from 'next';
export default function manifest():MetadataRoute.Manifest{return {name:'Meu Livro',short_name:'Meu Livro',description:'Seu estúdio de escrita, do rascunho ao livro pronto.',start_url:'/',display:'standalone',background_color:'#f7f5f1',theme_color:'#6d28d9',icons:[{src:'/favicon.svg',sizes:'any',type:'image/svg+xml'}]}}
