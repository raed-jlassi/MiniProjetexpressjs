import * as jose from 'jose';

// المفتاح السري متاع التشفير، نجيبوه مالـ .env وكان موش موجود نحطو كود احتياطي
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cle_secrete_super_securisee_123456789'
);

// فونكسيون باش نصنعو بيها توكن JWT جديد
// تقعد صالحة مدة 24 ساعة (24h)
export const signToken = async (payload) => {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
};

// فونكسيون باش نثبتو بيها في التوكن صحيح وما وفاتش صلوحيتو
export const verifyToken = async (token) => {
  const { payload } = await jose.jwtVerify(token, secretKey);
  return payload;
};

