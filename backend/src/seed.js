const db = require("./db");

const problems = [
    {
        id: "AB_SUM",
        title: "Tính tổng hai số A + B",
        difficulty: "Dễ",
        accepted_rate: "92.5%",
        description: "Cho hai số nguyên A và B. Hãy tính tổng của chúng.",
        time_limit_ms: 1000,
        memory_limit_mb: 256,
        input_spec: "Một dòng chứa hai số nguyên A và B cách nhau bởi khoảng trắng (-10^9 <= A, B <= 10^9).",
        output_spec: "In ra một số nguyên duy nhất là tổng của A và B.",
        sample_input: "5 7",
        sample_output: "12",
        tests: [
            { input: "5 7", expected: "12", sample: true },
            { input: "0 0", expected: "0" },
            { input: "-5 10", expected: "5" },
            { input: "123456789 987654321", expected: "1111111110" },
            { input: "-1000000000 1000000000", expected: "0" }
        ]
    },
    {
        id: "PRIME_CHECK",
        title: "Kiểm tra Số Nguyên Tố",
        difficulty: "Dễ",
        accepted_rate: "78.4%",
        description: "Cho một số nguyên dương N. Kiểm tra xem N có phải là số nguyên tố hay không.",
        time_limit_ms: 1000,
        memory_limit_mb: 256,
        input_spec: "Dòng duy nhất chứa một số nguyên dương N (1 <= N <= 10^9).",
        output_spec: "In ra 'YES' nếu N là số nguyên tố, ngược lại in ra 'NO'.",
        sample_input: "17",
        sample_output: "YES",
        tests: [
            { input: "17", expected: "YES", sample: true },
            { input: "4", expected: "NO" },
            { input: "1", expected: "NO" },
            { input: "2", expected: "YES" },
            { input: "999999999", expected: "NO" },
            { input: "999999937", expected: "YES" }
        ]
    },
    {
        id: "GCD_LCM",
        title: "Ước chung lớn nhất (UCLN)",
        difficulty: "Dễ",
        accepted_rate: "85.1%",
        description: "Cho hai số nguyên dương A và B. Tìm ước chung lớn nhất (UCLN) của hai số đó.",
        time_limit_ms: 1000,
        memory_limit_mb: 256,
        input_spec: "Một dòng chứa hai số nguyên dương A và B (1 <= A, B <= 10^9).",
        output_spec: "In ra một số nguyên duy nhất là ước chung lớn nhất của A và B.",
        sample_input: "24 36",
        sample_output: "12",
        tests: [
            { input: "24 36", expected: "12", sample: true },
            { input: "7 13", expected: "1" },
            { input: "100 100", expected: "100" },
            { input: "48 18", expected: "6" },
            { input: "1071 462", expected: "21" }
        ]
    },
    {
        id: "PALINDROME_NUM",
        title: "Số Đối Xứng (Palindrome)",
        difficulty: "Trung bình",
        accepted_rate: "64.2%",
        description: "Một số được gọi là số đối xứng nếu đọc từ trái sang phải cũng giống như đọc từ phải sang trái. Cho số nguyên dương N, kiểm tra xem N có đối xứng hay không.",
        time_limit_ms: 1000,
        memory_limit_mb: 256,
        input_spec: "Dòng duy nhất chứa số nguyên dương N (1 <= N <= 10^12).",
        output_spec: "In ra 'YES' nếu N là số đối xứng, ngược lại in ra 'NO'.",
        sample_input: "12321",
        sample_output: "YES",
        tests: [
            { input: "12321", expected: "YES", sample: true },
            { input: "123", expected: "NO" },
            { input: "7", expected: "YES" },
            { input: "1001", expected: "YES" },
            { input: "1234567890", expected: "NO" }
        ]
    },
    {
        id: "BINARY_SEARCH",
        title: "Tìm kiếm Nhị phân trên mảng",
        difficulty: "Trung bình",
        accepted_rate: "52.8%",
        description: "Cho mảng gồm N số nguyên đã được sắp xếp tăng dần và một giá trị X. Hãy xác định xem X có xuất hiện trong mảng hay không.",
        time_limit_ms: 1500,
        memory_limit_mb: 256,
        input_spec: "Dòng đầu tiên chứa hai số nguyên N và X (1 <= N <= 10^5, -10^9 <= X <= 10^9).\nDòng thứ hai chứa N số nguyên đã sắp xếp tăng dần.",
        output_spec: "In ra vị trí đầu tiên (chỉ số 1-based) của X trong mảng nếu tìm thấy, ngược lại in ra -1.",
        sample_input: "5 3\n1 2 3 4 5",
        sample_output: "3",
        tests: [
            { input: "5 3\n1 2 3 4 5", expected: "3", sample: true },
            { input: "5 6\n1 2 3 4 5", expected: "-1" },
            { input: "1 10\n10", expected: "1" },
            { input: "4 2\n1 2 2 3", expected: "2" },
            { input: "3 -5\n-10 -5 0", expected: "2" }
        ]
    },
    {
        id: "PERFECT_NUM",
        title: "Số Hoàn Hảo",
        difficulty: "Trung bình",
        accepted_rate: "59.0%",
        description: "Số hoàn hảo là số nguyên dương có tổng các ước thực sự (các ước nhỏ hơn nó) bằng chính nó. Tìm và đếm các số hoàn hảo nhỏ hơn hoặc bằng N.",
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        input_spec: "Dòng duy nhất chứa số nguyên dương N (1 <= N <= 10^4).",
        output_spec: "In ra danh sách các số hoàn hảo nhỏ hơn hoặc bằng N trên một dòng, cách nhau bởi khoảng trắng.",
        sample_input: "30",
        sample_output: "6 28",
        tests: [
            { input: "30", expected: "6 28", sample: true },
            { input: "10", expected: "6" },
            { input: "5", expected: "" },
            { input: "28", expected: "6 28" },
            { input: "1", expected: "" }
        ]
    },
    {
        id: "LIS_PROBLEM",
        title: "Dãy con tăng dài nhất (LIS)",
        difficulty: "Khó",
        accepted_rate: "35.6%",
        description: "Cho một dãy số gồm N phần tử. Hãy tìm độ dài của dãy con tăng dài nhất (các phần tử trong dãy con không nhất thiết phải liên tiếp nhau nhưng phải giữ nguyên thứ tự xuất hiện ban đầu).",
        time_limit_ms: 2000,
        memory_limit_mb: 256,
        input_spec: "Dòng đầu tiên chứa số nguyên dương N (1 <= N <= 1000).\nDòng thứ hai chứa N số nguyên cách nhau bởi dấu cách (-10^5 <= a_i <= 10^5).",
        output_spec: "In ra độ dài của dãy con tăng dài nhất tìm được.",
        sample_input: "6\n1 2 5 3 4 7",
        sample_output: "5",
        tests: [
            { input: "6\n1 2 5 3 4 7", expected: "5", sample: true },
            { input: "3\n1 2 3", expected: "3" },
            { input: "5\n5 4 3 2 1", expected: "1" },
            { input: "1\n42", expected: "1" },
            { input: "8\n10 9 2 5 3 7 101 18", expected: "4" }
        ]
    }
];

const insertProblem = db.prepare(`
    INSERT OR REPLACE INTO problems
    (id, title, difficulty, accepted_rate, description, time_limit_ms, memory_limit_mb,
     input_spec, output_spec, sample_input, sample_output)
    VALUES (@id, @title, @difficulty, @accepted_rate, @description, @time_limit_ms,
            @memory_limit_mb, @input_spec, @output_spec, @sample_input, @sample_output)
`);

const deleteTests = db.prepare("DELETE FROM test_cases WHERE problem_id = ?");
const insertTest = db.prepare(`
    INSERT INTO test_cases (problem_id, input, expected_output, is_sample, order_index)
    VALUES (?, ?, ?, ?, ?)
`);

const seed = db.transaction(() => {
    // Tạm thời tắt foreign keys để dọn dẹp dữ liệu cũ nếu cần, 
    // nhưng ở đây ta dùng INSERT OR REPLACE cho problems và dọn test_cases theo id.
    for (const problem of problems) {
        const { tests, ...row } = problem;
        insertProblem.run(row);

        deleteTests.run(problem.id);
        tests.forEach((tc, index) => {
            insertTest.run(
                problem.id,
                tc.input,
                tc.expected,
                tc.sample ? 1 : 0,
                index
            );
        });
    }
});

try {
    seed();
    console.log(`Đã seed ${problems.length} bài tập vào database.`);
} catch (err) {
    console.error("Lỗi khi seed dữ liệu:", err.message);
}
