# Site Structure:

Pod: nginx
- volume mount ssl certs (readonly)
- proxy forward port 80 well-known/acme-challenge (or whatever it is) to the lets-encrypt pod
- redirect the rest of port 80 to SSL
- proxy forward port 443 to various content pods based on subdomain

Pod: lets-encrypt
- volume mount ssl certs (read-write)
- does the let's encrypt thing
- advertised by a service so nginx can find it via Kubernetes service DNS resolution

Pod: gitlabs
- content pod
- Kubernetes service

Pod: static-landing
- content pod
- runs nginx to serve static content
- Kubernetes service

Pod: staging
- content pod
- somehow protected (htpassword?)
- Kubernetes services




Resources:
- Kubernetes services [1]
  - service yaml files
  - connecting services with pods
  - service DNS resolution
    - link to DNS server add-on?
- Kubernetes guestbook example [2]
  - example service config files, referencing services from pods
- Background on let's encrypt w/ docker not quite how I want to do it [3]
- nginx docker companion container [4]
  - I think this is basically what I want, although I sense some black magic
  - Example implementation [5]


[1]: https://kubernetes.io/docs/concepts/services-networking/service/
[2]: https://cloud.google.com/kubernetes-engine/docs/tutorials/guestbook
[3]: https://miki725.github.io/docker/crypto/2017/01/29/docker+nginx+letsencrypt.html
[4]: https://hub.docker.com/r/jrcs/letsencrypt-nginx-proxy-companion/
[5]: https://cloud.google.com/community/tutorials/nginx-reverse-proxy-docker
