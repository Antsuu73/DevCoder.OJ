// js/mock-data.js

/**
 * Danh sách các bài tập thuật toán mẫu dành cho học sinh THCS Lê Tấn Bê (HSG 9)
 */
const mockProblems = [
    {
        id: "AB_SUM",
        title: "Tính tổng hai số A + B",
        difficulty: "Dễ",
        acceptedRate: "92.5%",
        description: "Cho hai số nguyên A và B. Hãy tính tổng của chúng.",
        timeLimit: "1.0s",
        memoryLimit: "256MB",
        inputSpec: "Một dòng chứa hai số nguyên A và B cách nhau bởi khoảng trắng (-10^9 <= A, B <= 10^9).",
        outputSpec: "In ra một số nguyên duy nhất là tổng của A và B.",
        sampleInput: "5 7",
        sampleOutput: "12"
    },
    {
        id: "PRIME_CHECK",
        title: "Kiểm tra Số Nguyên Tố",
        difficulty: "Dễ",
        acceptedRate: "78.4%",
        description: "Cho một số nguyên dương N. Kiểm tra xem N có phải là số nguyên tố hay không.",
        timeLimit: "1.0s",
        memoryLimit: "256MB",
        inputSpec: "Dòng duy nhất chứa một số nguyên dương N (1 <= N <= 10^9).",
        outputSpec: "In ra 'YES' nếu N là số nguyên tố, ngược lại in ra 'NO'.",
        sampleInput: "17",
        sampleOutput: "YES"
    },
    {
        id: "GCD_LCM",
        title: "Ước chung lớn nhất (UCLN)",
        difficulty: "Dễ",
        acceptedRate: "85.1%",
        description: "Cho hai số nguyên dương A và B. Tìm ước chung lớn nhất (UCLN) của hai số đó.",
        timeLimit: "1.0s",
        memoryLimit: "256MB",
        inputSpec: "Một dòng chứa hai số nguyên dương A và B (1 <= A, B <= 10^9).",
        outputSpec: "In ra một số nguyên duy nhất là ước chung lớn nhất của A và B.",
        sampleInput: "24 36",
        sampleOutput: "12"
    },
    {
        id: "PALINDROME_NUM",
        title: "Số Đối Xứng (Palindrome)",
        difficulty: "Trung bình",
        acceptedRate: "64.2%",
        description: "Một số được gọi là số đối xứng nếu đọc từ trái sang phải cũng giống như đọc từ phải sang trái. Cho số nguyên dương N, kiểm tra xem N có đối xứng hay không.",
        timeLimit: "1.0s",
        memoryLimit: "256MB",
        inputSpec: "Dòng duy nhất chứa số nguyên dương N (1 <= N <= 10^12).",
        outputSpec: "In ra 'YES' nếu N là số đối xứng, ngược lại in ra 'NO'.",
        sampleInput: "12321",
        sampleOutput: "YES"
    },
    {
        id: "BINARY_SEARCH",
        title: "Tìm kiếm Nhị phân trên mảng",
        difficulty: "Trung bình",
        acceptedRate: "52.8%",
        description: "Cho mảng gồm N số nguyên đã được sắp xếp tăng dần và một giá trị X. Hãy xác định xem X có xuất hiện trong mảng hay không.",
        timeLimit: "1.5s",
        memoryLimit: "256MB",
        inputSpec: "Dòng đầu tiên chứa hai số nguyên N và X (1 <= N <= 10^5, -10^9 <= X <= 10^9).\nDòng thứ hai chứa N số nguyên đã sắp xếp tăng dần.",
        outputSpec: "In ra vị trí đầu tiên (chỉ số 1-based) của X trong mảng nếu tìm thấy, ngược lại in ra -1.",
        sampleInput: "5 3\n1 2 3 4 5",
        sampleOutput: "3"
    },
    {
        id: "PERFECT_NUM",
        title: "Số Hoàn Hảo",
        difficulty: "Trung bình",
        acceptedRate: "59.0%",
        description: "Số hoàn hảo là số nguyên dương có tổng các ước thực sự (các ước nhỏ hơn nó) bằng chính nó. Tìm và đếm các số hoàn hảo nhỏ hơn hoặc bằng N.",
        timeLimit: "2.0s",
        memoryLimit: "256MB",
        inputSpec: "Dòng duy nhất chứa số nguyên dương N (1 <= N <= 10^4).",
        outputSpec: "In ra danh sách các số hoàn hảo nhỏ hơn hoặc bằng N trên một dòng, cách nhau bởi khoảng trắng.",
        sampleInput: "30",
        sampleOutput: "6 28"
    },
    {
        id: "LIS_PROBLEM",
        title: "Dãy con tăng dài nhất (LIS)",
        difficulty: "Khó",
        acceptedRate: "35.6%",
        description: "Cho một dãy số gồm N phần tử. Hãy tìm độ dài của dãy con tăng dài nhất (các phần tử trong dãy con không nhất thiết phải liên tiếp nhau nhưng phải giữ nguyên thứ tự xuất hiện ban đầu).",
        timeLimit: "2.0s",
        memoryLimit: "256MB",
        inputSpec: "Dòng đầu tiên chứa số nguyên dương N (1 <= N <= 1000).\nDòng thứ hai chứa N số nguyên cách nhau bởi dấu cách (-10^5 <= a_i <= 10^5).",
        outputSpec: "In ra độ dài của dãy con tăng dài nhất tìm được.",
        sampleInput: "6\n1 2 5 3 4 7",
        sampleOutput: "5"
    }
];

/**
 * Hàm lấy toàn bộ danh sách bài tập mẫu
 */
function getProblems() {
    return mockProblems;
}

/**
 * Hàm lấy thông tin chi tiết của một bài tập theo ID
 * @param {string} id - Mã định danh của bài tập
 */
function getProblemById(id) {
    return mockProblems.find(prob => prob.id === id) || null;
}
