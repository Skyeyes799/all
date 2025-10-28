#include <stdio.h>
#include <string.h>
#include <ctype.h>
#define MAX 10

int modInverse(int a, int m) {
    a = a % m;
    for (int x = 1; x < m; x++)
        if ((a * x) % m == 1)
            return x;
    return -1;
}

int determinant(int a[MAX][MAX], int n) {
    int det = 0;
    int submatrix[MAX][MAX];
    if (n == 1)
        return a[0][0];
    for (int x = 0; x < n; x++) {
        int subi = 0;
        for (int i = 1; i < n; i++) {
            int subj = 0;
            for (int j = 0; j < n; j++) {
                if (j == x)
                    continue;
                submatrix[subi][subj] = a[i][j];
                subj++;
            }
            subi++;
        }
        int sign = (x % 2 == 0) ? 1 : -1;
        det += sign * a[0][x] * determinant(submatrix, n - 1);
    }
    return det;
}

void adjoint(int a[MAX][MAX], int adj[MAX][MAX], int n) {
    if (n == 1) {
        adj[0][0] = 1;
        return;
    }
    int sign, temp[MAX][MAX];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            int subi = 0;
            for (int row = 0; row < n; row++) {
                if (row == i)
                    continue;
                int subj = 0;
                for (int col = 0; col < n; col++) {
                    if (col == j)
                        continue;
                    temp[subi][subj] = a[row][col];
                    subj++;
                }
                subi++;
            }
            sign = ((i + j) % 2 == 0) ? 1 : -1;
            adj[j][i] = (sign * determinant(temp, n - 1)) % 26;
            if (adj[j][i] < 0)
                adj[j][i] += 26;
        }
    }
}

int inverseKey(int a[MAX][MAX], int inv[MAX][MAX], int n) {
    int det = determinant(a, n);
    det = (det % 26 + 26) % 26;
    int invDet = modInverse(det, 26);
    if (invDet == -1) {
        printf("Matrix not invertible mod 26!\n");
        return 0;
    }
    int adj[MAX][MAX];
    adjoint(a, adj, n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            inv[i][j] = ((adj[i][j] * invDet) % 26 + 26) % 26;
    return 1;
}

int main() {
    int n;
    int key[MAX][MAX], invKey[MAX][MAX];
    char ciphertext[100];
    printf("Enter size of key matrix (n): ");
    scanf("%d", &n);
    printf("Enter %d x %d key matrix (0-25 values):\n", n, n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &key[i][j]);
    if (!inverseKey(key, invKey, n))
        return 0;
    printf("Enter ciphertext (without space): ");
    scanf("%s", ciphertext);
    int len = strlen(ciphertext);
    for (int i = 0; i < len; i++)
        ciphertext[i] = toupper(ciphertext[i]);
    printf("Decrypted text: ");
    for (int i = 0; i < len; i += n) {
        for (int row = 0; row < n; row++) {
            int sum = 0;
            for (int col = 0; col < n; col++) {
                sum += invKey[row][col] * (ciphertext[i + col] - 'A');
            }
            printf("%c", ((sum % 26) + 26) % 26 + 'A');
        }
    }
    printf("\n");
    return 0;
}
