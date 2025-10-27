import java.math.*;
import java.util.*;

class RSA{
	public static void main(String[] args){
		int p, q, n, z, d = 0, e, i;
		int msg = 9;
		double c;
		BigInteger msgBack;
		p = 3; q = 11; n = p * q;
		z = (p - 1) * (q - 1);
		System.out.println("Value of z = " + z);
		for(e = 2; e < z; e++)
			if(gcd(e, z) == 1)
				break;
		System.out.println("Value of e = " + e);
		for(i = 0; i < 9; i++){
			int x = 1 + (i * z);
			if(x % e == 0){
				d = x / e;
				break;
			}
		}
		System.out.println("Value of d = " + d);
		c = (Math.pow(msg, e)) % n;
		System.out.println("Encoded Message: " + c);
		BigInteger N = BigInteger.valueOf(n);
		BigInteger C = BigDecimal.valueOf(c).toBigInteger();
		msgBack = (C.pow(d)).mod(N);
		System.out.println("Decrypted message: " + msgBack);
	}

	static int gcd(int e, int z){
		if(e == 0)
			return z;
		else
			return gcd(z % e, e);
	}
}
