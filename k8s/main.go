package main

import (
	"context"
	"encoding/json"

	"github.com/MeteorsLiu/virtuallabs/backend/queue"
	"github.com/zeromicro/go-queue/kq"
	"github.com/zeromicro/go-zero/core/conf"
)

func consumer(ctx context.Context, key, value string) error {
	if key != "k8s" {
		return nil
	}

	var message queue.VMRequest
	json.Unmarshal([]byte(value), &message)

	switch message.OpCode {
	case queue.OpCreateVM:
		return createVm(message.Vmname, message.Vmid+80)
	case queue.OpDeleteVM:
		return deleteVm(message.Vmname)
	}

	return nil
}

func main() {
	var c kq.KqConf

	conf.MustLoad("kq.yml", &c)

	q, err := kq.NewQueue(c, kq.WithHandle(consumer))
	if err != nil {
		panic(err)
	}

	defer q.Stop()
	q.Start()

}
