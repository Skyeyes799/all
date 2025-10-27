import java.util.*;

class difi{
	public static void main(String[] args){
		long P, G, x, a, y, b, ka, kb;
		Scanner sc = new Scanner(System.in);
		System.out.println("Both the users should agreed upon the public keys G and P");

		System.out.println("Enter value for public key of G: ");
		G = sc.nextLong();
		System.out.println("Enter value for public key of P: ");
		P = sc.nextLong();

		System.out.println("Enter value for private key a by user 1: ");
		a = sc.nextLong();
		System.out.println("Enter value for private key b by user 2: ");
		b = sc.nextLong();

		x = calculatePower(G, a, P);
		y = calculatePower(G, b, P);
		ka = calculatePower(y, a, P);
		kb = calculatePower(x, b, P);

		System.out.println("Secret key for user 1 is: " + ka);
		System.out.println("Secret key for user 2 is: " + kb);
	}

	public static long calculatePower(long x, long y, long P){
		long result;
		if(y == 1)
			return x;
		else{
			result = ((long)Math.pow(x, y)) % P;
			return result;
		}
	}
}
