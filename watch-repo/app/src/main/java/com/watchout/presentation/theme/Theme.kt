package com.watchout.presentation.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material3.ColorScheme
import androidx.wear.compose.material3.MaterialTheme

// 👇👇👇 darkColorScheme을 Wear OS용 ColorScheme으로 수정했습니다. 👇👇👇
private val wearColorScheme = ColorScheme(
    primary = Color(0xFF7A1E1E),
    onPrimary = Color.White,
    background = Color.Black,
    onBackground = Color.White,
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005)
)

@Composable
fun WatchOutTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = wearColorScheme,
        typography = Typography,
        content = content
    )
}
