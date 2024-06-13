import ssl

ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
ssl_context.load_cert_chain(certfile = './safty-construction.kro.kr/certificate.crt', keyfile= './safty-construction.kro.kr/private.key')
ssl_context.load_verify_locations(cafile='./safty-construction.kro.kr/ca_bundle.pem') # 중간 인증서