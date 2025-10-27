#include <stdio.h>
#include <string.h>
#define BUF 100
int main()
{
char plaintext[BUF], key[BUF], ciphertext[BUF], decrypted[BUF];
int i;
printf("Enter the plaintext: ");
scanf("%s", plaintext);
printf("Enter the key (same length as plaintext): ");
scanf("%s", key);
int len = strlen(plaintext);
if (len != strlen(key)) {
printf("Error: Key length must match plaintext length.\n");
return 1;
}
for (i = 0; i < len; i++) {
ciphertext[i] = plaintext[i] ^ key[i];
}
ciphertext[i] = '\0';
printf("Encrypted Message (in characters):");
char ct[BUF];
for (i = 0; i < len; i++)
{
ct[i]=(char)(((ciphertext[i])%26)+'a');
printf("%c", ct[i]);
}
printf("\n");

for (i = 0; i < len; i++) {
decrypted[i] = ciphertext[i] ^ key[i];
}
decrypted[i] = '\0';
printf("Decrypted Message is:");
printf("%s\n", decrypted);
return 0;
}
