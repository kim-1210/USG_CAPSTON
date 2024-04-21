import ssl

ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
ssl_context.load_cert_chain(certfile = './safty-construction.kro.kr/certificate.crt', keyfile= './safty-construction.kro.kr/private.key')