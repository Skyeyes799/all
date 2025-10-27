#include<stdio.h>
#include<string.h>
#include<ctype.h>
int main()
{
char string[100]={'\0'}, cipher[100]={'\0'};
int key;
printf("Enter the Plain text: ");
fgets(string, 100, stdin);
printf("\nEnter the key: ");
scanf("%d", &key);
for(int i=0; i<strlen(string); i++){
if(isupper(string[i]))
cipher[i] = ((string[i]-'A')+key)%26+'A';
else if(islower(string[i]))
cipher[i] = ((string[i]-'a')+key)%26+'a';
else
cipher[i] = string[i];
}
printf("Cipher text: %s", cipher);
}
