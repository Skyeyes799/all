import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.NoSuchAlgorithmException;
import java.util.Scanner;
import sun.misc.BASE64Encoder;

public class DSAold{
	public static void main(String[] args){
		try{
			BASE64Encoder enc = new BASE64Encoder();
			Scanner s = new Scanner(System.in);
			System.out.print("Enter Text: ");
			String msg = s.nextLine();
			KeyPairGenerator keygen = KeyPairGenerator.getInstance("DSA");
			keygen.initialize(2048);
			KeyPair pair = keygen.generateKeyPair();
			PrivateKey pk = pair.getPrivate();
			Signature sign = Signature.getInstance("SHA256withDSA");
			sign.initSign(pk);
			byte[] bytes = msg.getBytes();
			sign.update(bytes);
			byte[] signature = sign.sign();
			System.out.println("Digital Sign for given text: " + enc.encode(signature));
			s.close();
		}catch(Exception e){
			e.printStackTrace();
		}
	}
}
