# Estágio de Build
FROM node:18-alpine as build

WORKDIR /app

# Copiar package configs
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Buildar aplicação (gera a pasta dist)
RUN npm run build

# Estágio de Produção (Nginx)
FROM nginx:alpine

# Copiar o build do estágio anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
