HEALTH_KEYWORDS = {
    'hen_suyen': ['hen', 'hen suyễn', 'suyễn', 'khó thở'],
    'tim_mach': ['tim mạch', 'huyết áp cao', 'cao huyết áp', 'nhịp tim không đều'],
    'xuong_khop': ['đau khớp', 'thoái hóa', 'viêm khớp', 'đau lưng'],
    'diabetes': ['tiểu đường', 'đường huyết cao', 'diabetes'],
    'obesity': ['béo phì', 'thừa cân', 'béo', 'mập']
}

TAG_RULES = {
    'hen_suyen': {
        'exclude': ['cardio', 'hiit', 'chạy bộ', 'sức bền'],
        'recommend': ['yoga', 'đi bộ', 'bài tập nhẹ nhàng']
    },
    'tim_mach': {
        'exclude': ['tập nặng', 'powerlifting', 'hiit'],
        'recommend': ['đi bộ', 'yoga', 'bơi lội nhẹ nhàng']
    },
    'xuong_khop': {
        'exclude': ['chạy bộ', 'nhảy', 'squat nặng'],
        'recommend': ['yoga', 'bơi lội', 'tập nhẹ']
    },
    'diabetes': {
        'exclude': ['tập quá sức'],
        'recommend': ['cardio nhẹ', 'đi bộ', 'yoga']
    },
    'obesity': {
        'exclude': ['tập nặng', 'chạy quá sức'],
        'recommend': ['đi bộ', 'bơi lội', 'cardio nhẹ nhàng']
    }
} 