package persistence

import (
	"log"

	"database/sql"
	"github.com/CodFrm/cxmooc-tools/server/infrastructure/config"
	_ "github.com/go-sql-driver/mysql"
)

var mysql *sql.DB

func init() {
	db, err := sql.Open("mysql", config.AppConfig.MySQL.Dsn)
	if err != nil {
		log.Fatalf("sql open error: %v", err)
	}
	mysql = db
}
