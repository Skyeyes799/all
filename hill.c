#include <stdio.h>
#include <string.h>
#include <ctype.h>
#define MAX 10

int main() {
    int n;
    int key[MAX][MAX];
    char plaintext[100];
    
    printf("Enter size of key matrix (n): ");
    scanf("%d", &n);
    
    printf("Enter %d x %d key matrix (0-25 values):\n", n, n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &key[i][j]);
    
    printf("Enter plaintext (without space): ");
    scanf("%s", plaintext);
    
    int len = strlen(plaintext);

    while (len % n != 0) {
        plaintext[len++] = 'X';
    }
    plaintext[len] = '\0';
    
    for (int i = 0; i < len; i++)
        plaintext[i] = toupper(plaintext[i]);

    printf("Encrypted text: ");

    for (int i = 0; i < len; i += n) {
        for (int row = 0; row < n; row++) {
            int sum = 0;
            for (int col = 0; col < n; col++) {
                sum += key[row][col] * (plaintext[i + col] - 'A');
            }
            printf("%c", (sum % 26) + 'A');
        }
    }
    printf("\n");

    return 0;
}

