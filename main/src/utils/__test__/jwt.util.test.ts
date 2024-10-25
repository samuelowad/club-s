import { JwtUtil }  from '../jwt.util';
import { UserRole } from '../../enum/userRole.enum';
import jwt from 'jsonwebtoken';

jest.mock('fs');
jest.mock('path');

describe('JwtUtil', () => {
  const mockAppSecret = 'mockAppSecret';
  const mockPrivateKey =`-----BEGIN RSA PRIVATE KEY-----
MIIEoQIBAAKCAQBa9Xy3yrHojZKPN9r8EJV4RvTVNygXrBYWBXM0V7lLlop1HZnu
nLaTUXDVsvXda6UsYJb/G4HJ/BLedxvXbA9xgQ5s7umiXsC8qrr0nd5zFNB1BZgF
zwGhtc9eYB35lyW1ybLhhlOE0QJrCeLV6Ouv99ik+uVTF9o7z+tAjyZCtikjG+F0
zdw/x+KVX2cuwEkIS+g5isWrhM8diQCSxV2S8EoR6QPB+R3McqxTZA7eKaFqZnHC
YMBVu3JT5NK0IkZoNQbPzBPpcX8uSQ06BrlOeyy7PN0dy66f9k3RvDUcQKz0G+Y3
EWZbhCfp4MZxQQ+Nzr0jeBBhbCzfUQ1cGOr5AgMBAAECggEAVDmOs+1IEgvN0zoo
V1HP5iDmIuzA/jKF/Pws8iHs3XZXXRz85btNQFqgPfFJwy8jMlV6XF0PMIZuvnrS
WAaiwjp7rhkIVCajF9CL72ijjDKQ2FtGqtJFM4VTsJMWDoCMFangLv6gJZMYRx9P
YT4dx8KbZCFC6k9i8BGWSCCFkC1a2EXYfgMJns3C34BEdcYD2qDZ2sR64o+CnCnd
vU7bxL+MiFpReuqSRuBhkL/QC8Pg+zYABfDl6pXb7Y/4k3ieCAGhd/Mz5k5HezwK
xm8SLdaXDSzag19m09bylHBG03g2sX56x+ODl6qPEj/saY80ENwuu70q1yYZ9TNe
w7xhFQKBgQCqVmH8ked25wHN7EAxgcXb2jsE8eV2W0eoETfNbluAGDk/3lmsalJc
WjA1h22MVUlFl7mEuDYlXKJmpU2BU5ZQPJVDlkchYq7fnjEgO3vURNDF1IsG8l7h
OmFU90Ii8J8n8+NI8g6Aq3XfSdKfMpNXRgwlxm+IcjPorNwo3ozTOwKBgQCIs73C
XNinTtiTdIQ9I1fgWubH50Oef7MZ6b6ZQ1l663uVQrjMEUPx3UwVqBqiQnYgCKBD
5Q+PpgYUzx7S+efL3VamUSlFfVbuEkDUDoTIoGKncf14tBaLs3Tb6sTxsXeR7XcG
pXMG+86OS22I/ndT+PDF4IH3d1e/p5Prd6YvWwKBgBF39GqTh/pQrIWywc6R8Xmf
gsf6Cr89kzawNVnTBH05fr2HDwk4iiPAeAs1TU3D/VSuv67VuW/RdTIzp6Qor1Sh
MemRgs/wr+Bs97rHfuaA/CwdpPhcaNCOTScKiHTO2nOddmSntkcJznfMuVXsOOIN
Y/eHxy5mD96/w4BJeoW7AoGAdmCwAo/ETZ3Jjmdn3Emu32nYT2PE+ow63EW995qK
8hbZffe5b33ECL5KFLbt2XUUNclCf4jsYMi0m3CAkNI4GCIj1wKRasuPa7oCyZ+I
/PNmevoLNWs92twcZhR3V5UGpies2uSLJ5EG3dITmH5Dd0QrvC8eXN3L7vt+7HlA
P+ECgYBycwrCqNgQtMaBkv4tomBOVVilQVya/kbrlHx9j3+XySvrOUcK5RYZsPQD
WUJVS+WPbDhT6Y9MLPu/bQzxB+CDIJSMjIEQWiTu1ChX+S/iDMWAoY1SWsqgkCI1
xyUFP9SVXW/eHV5bHrS4ajDqlsV5hJ24KQxwKtwG6uRnCkZR0g==
-----END RSA PRIVATE KEY-----
`;

  const mockPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBa9Xy3yrHojZKPN9r8EJV4
RvTVNygXrBYWBXM0V7lLlop1HZnunLaTUXDVsvXda6UsYJb/G4HJ/BLedxvXbA9x
gQ5s7umiXsC8qrr0nd5zFNB1BZgFzwGhtc9eYB35lyW1ybLhhlOE0QJrCeLV6Ouv
99ik+uVTF9o7z+tAjyZCtikjG+F0zdw/x+KVX2cuwEkIS+g5isWrhM8diQCSxV2S
8EoR6QPB+R3McqxTZA7eKaFqZnHCYMBVu3JT5NK0IkZoNQbPzBPpcX8uSQ06BrlO
eyy7PN0dy66f9k3RvDUcQKz0G+Y3EWZbhCfp4MZxQQ+Nzr0jeBBhbCzfUQ1cGOr5
AgMBAAE=
-----END PUBLIC KEY-----
`;

  const jwtUtil = new JwtUtil(mockPrivateKey, mockPublicKey);


  beforeAll(() => {
    process.env.APP_SECRET = mockAppSecret;
    process.env.TIME_TO_LIVE = '2';

    jest.resetModules();
  });

  beforeEach(() => {
    process.env.APP_SECRET = 'test-secret';
    process.env.TIME_TO_LIVE = '2';
  });
  describe('sign', () => {
    it('should sign a token', () => {
      const email = 'test@example.com';
      const id = 1;
      const role = UserRole.CUSTOMER;

      const token = jwtUtil.sign(email, id, role);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      expect(() => Buffer.from(token, 'base64')).not.toThrow();
    });
  })

  describe('verify', () => {
    it('should successfully verify and decrypt a valid token', () => {
      const email = 'test@example.com';
      const id = 1;
      const role = UserRole.CUSTOMER;

      const token = jwtUtil.sign(email, id, role);
      const decoded = jwtUtil.verify(token);

      expect(decoded).toEqual(
          expect.objectContaining({
            email,
            id,
            role,
            iat: expect.any(Number),
            exp: expect.any(Number),
          })
      );
    });

    it('should throw error for expired token', () => {
      jest.useFakeTimers();

      const token = jwtUtil.sign('test@example.com', 1, UserRole.CUSTOMER);

      // Advance time by 3 hours (beyond the 2-hour expiration)
      jest.advanceTimersByTime(3 * 60 * 60 * 1000);

      expect(() => {
        jwtUtil.verify(token);
      }).toThrow(jwt.TokenExpiredError);

      jest.useRealTimers();
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        jwtUtil.verify('invalid-token');
      }).toThrow();
    });
  });

  describe('error cases', () => {
    it('should use default APP_SECRET when env variable is not set', () => {
      delete process.env.APP_SECRET;

      const email = 'test@example.com';
      const id = 1;
      const role = UserRole.CUSTOMER;

      const token = jwtUtil.sign(email, id, role);
      const decoded = jwtUtil.verify(token);

      expect(decoded.email).toBe(email);
      expect(decoded.id).toBe(id);
      expect(decoded.role).toBe(role);
    });

    it('should handle malformed tokens', () => {
      const malformedTokens = [
        '',
        'invalid',
        'invalid.token.format',
        Buffer.from('invalid').toString('base64'),
      ];

      malformedTokens.forEach(token => {
        expect(() => {
          jwtUtil.verify(token);
        }).toThrow();
      });
    });
  });

})
